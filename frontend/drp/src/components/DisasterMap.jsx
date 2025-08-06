import React, { useEffect, useState, useRef } from 'react';
import MapView, {
  Marker,
  Circle,
  Callout,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { isWithinDistance, isInHitArea, getDistanceInMeters } from '../services/location/distanceService';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidentTypes } from '../redux/incidentTypesSlice';
import { getEvacuationRoute, getSafeRouteToShelter } from '../services/evacuation/evacuationService';
import { startLocationTracking, stopLocationTracking } from '../services/location/trackLocation';
import IncidentMarker from '../mapComponents/incidentMarker';
import LiveLocationMarker from '../mapComponents/liveLocationMarker';
import ShelterMarker from '../mapComponents/shelterMarker';
import UserLocMarker from '../mapComponents/userLocMarker';
import RouteStartMarker from '../mapComponents/routeStartMarker';
import RouteEndMarker from '../mapComponents/routeEndMarker';

const DisasterMap = React.memo(
  ({ shelters, incidents, userLocations, latitude, longitude, setLocation }) => {
    const [zoomLevel, setZoomLevel] = useState(15);
    const [markerSize, setMarkerSize] = useState(24); // Default marker size 

    const [isLiveTracking, setIsLiveTracking] = useState(true);
    const [evacRoute, setEvacRoute] = useState(null);
    const [safeRoute, setSafeRoute] = useState(null);
    const [routing, setRouting] = useState(false);
    const [isInHitAreaState, setIsInHitAreaState] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({ lat: latitude, lng: longitude });
    const [routeCalculated, setRouteCalculated] = useState(false);
    const [hasExitedHitArea, setHasExitedHitArea] = useState(false);
    const [initialLocation, setInitialLocation] = useState(null);
    const [showShelterNavigationPrompt, setShowShelterNavigationPrompt] = useState(false);
    const [routeStartPoint, setRouteStartPoint] = useState(null);
    const [routeEndPoint, setRouteEndPoint] = useState(null);

    const SHELTER_PROXIMITY_THRESHOLD = 75;

    // Use refs to track state changes without triggering re-renders
    const mapRef = useRef(null);
    const initialLocationRef = useRef(null);
    const routeCalculatedRef = useRef(false);
    const hasExitedHitAreaRef = useRef(false);
    const isInHitAreaRef = useRef(false);
    const safeRouteRef = useRef(safeRoute);
    const routeEndPointRef = useRef(routeEndPoint);
    const zoomRef = useRef(zoomLevel);

    const types = useSelector(state => state.incidentTypes.incidentTypes);
    const dispatch = useDispatch();

    useEffect(() => {
      safeRouteRef.current = safeRoute;
    }, [safeRoute]);

    useEffect(() => {
      routeEndPointRef.current = routeEndPoint;
    }, [routeEndPoint]);

    useEffect(() => {
      hasExitedHitAreaRef.current = hasExitedHitArea;
    }, [hasExitedHitArea]);

    useEffect(() => {
      zoomRef.current = zoomLevel + 1;
    }, [zoomLevel]);

    //move camera with user's movements 
    const animateToLocation = (location) => {
      if (!mapRef.current || !location) return;
      console.log("from animate camera: ", zoomRef.current);
      
      mapRef.current.animateCamera({
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        zoom: zoomRef.current,
        heading: 0,
        pitch: 0,
        altitude: 1000,
        duration: 1000, // Smooth 1-second animation
      });
    };

    // Fetch Redux data on component mount
    useEffect(() => {
      const fetchData = async () => {
        try {
          await Promise.all([dispatch(fetchIncidentTypes())]);
          // console.log('Redux data fetch completed');
        } catch (err) {
          console.error('Error fetching data:', err);
        }
      };

      fetchData();
    }, [dispatch]);

    const startLiveTracking = () => {
      console.log('Starting live tracking');
      setIsLiveTracking(true);

      startLocationTracking((location) => {
        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        console.log('Live location update:', newLocation);
        setCurrentLocation(newLocation);
        setLocation({
          latitude: newLocation.lat,
          longitude: newLocation.lng
        });
        animateToLocation(newLocation);

        // Always check hit area status with live tracking
        checkHitAreaStatus(newLocation);
        console.log("safe route ", safeRoute, "; end pt: ", routeEndPoint);

        if (safeRouteRef.current && routeEndPointRef.current) {
          const distanceToShelter = getDistanceInMeters(
            newLocation.lat,
            newLocation.lng,
            routeEndPointRef.current.lat,
            routeEndPointRef.current.lng
          );

          console.log(`Distance to shelter: ${distanceToShelter}m`);

          if (distanceToShelter <= SHELTER_PROXIMITY_THRESHOLD) {
            console.log('Reached shelter - clearing route');
            setSafeRoute(null);
            setRouteStartPoint(null);
            setRouteEndPoint(null);
            setShowShelterNavigationPrompt(false);
            safeRouteRef.current = null;
          }
        }
      }, { enableHighAccuracy: true, timeout: 5000 });
    };

    const stopLiveTracking = () => {
      setIsLiveTracking(false);
      stopLocationTracking();
      console.log('Stopped live tracking');
    };

    // Initialize location and calculate route only once at the beginning
    useEffect(() => {
      if (!latitude || !longitude || initialLocationRef.current) return;

      const initialLoc = { lat: latitude, lng: longitude };
      initialLocationRef.current = initialLoc;
      setInitialLocation(initialLoc);
      setCurrentLocation(initialLoc);

      const initializeRoute = async () => {
        try {
          // Convert incidents to hit areas format with more accurate radius
          const hitAreas = incidents.map(incident => ({
            lat: incident.location.coordinates[1],
            lng: incident.location.coordinates[0],
            radius: 500 // 500m radius for each incident
          }));

          const inHit = isInHitArea(latitude, longitude, hitAreas);
          setIsInHitAreaState(inHit);
          isInHitAreaRef.current = inHit;

          if (inHit) {
            console.log('User is in hit area - calculating evacuation route');
            await getEvacuationRouteForLocation(initialLoc);
          } else {
            console.log('User is safe - no initial shelter route needed');
          }

          routeCalculatedRef.current = true;
          setRouteCalculated(true);
        } catch (error) {
          console.error('Error initializing route:', error);
        }
      };

      initializeRoute();
    }, [latitude, longitude, incidents]);

    // Check hit area status and update routes
    const checkHitAreaStatus = async (location) => {
      try {
        console.log('Checking hit area status for location:', location);

        // Convert incidents to hit areas format
        const hitAreas = incidents.map(incident => ({
          lat: incident.location.coordinates[1],
          lng: incident.location.coordinates[0],
          radius: 500 // 500m radius for each incident
        }));
        const inHit = isInHitArea(location.lat, location.lng, hitAreas);
        const wasInHit = isInHitAreaRef.current;

        setIsInHitAreaState(inHit);
        isInHitAreaRef.current = inHit;
        hasExitedHitAreaRef.current = !inHit;
        console.log('Hit area status:', { inHit, wasInHit, hasExitedHitAreaRef: hasExitedHitAreaRef.current });

        if (inHit) {
          setHasExitedHitArea(false);
        }

        // Only recalculate route if status changed from in hit area to out
        if (!inHit && wasInHit && hasExitedHitAreaRef.current) {
          console.log('User just exited hit area - clearing evacuation route and showing shelter navigation prompt');
          hasExitedHitAreaRef.current = true;
          setHasExitedHitArea(true);

          // Clear all evacuation-related state
          setEvacRoute(null);
          setSafeRoute(null);
          setRouteStartPoint(null);
          setRouteEndPoint(null);

          // Show shelter navigation prompt
          setShowShelterNavigationPrompt(true);
        } else if (inHit && !wasInHit) {
          console.log('User entered hit area');
          await getEvacuationRouteForLocation(location); //++
        } else if (inHit && wasInHit) {
          console.log('User still in hit area');
        } else if (!inHit && !wasInHit) {
          console.log('User still outside hit area');
        }
      } catch (error) {
        console.error('Error checking hit area status:', error);
      }
    };

    // Get evacuation route for current location
    const getEvacuationRouteForLocation = async (location) => {
      if (!incidents || incidents.length === 0) return;

      setRouting(true);
      try {
        // Convert incidents to hit areas format
        const hitAreas = incidents.map(incident => ({
          lat: incident.location.coordinates[1],
          lng: incident.location.coordinates[0],
          radius: 500 // 500m radius for each incident
        }));
        console.log("hitAreas", hitAreas);
        console.log("location", location);
        const evacuationData = await getEvacuationRoute(location, hitAreas);
        console.log("evacuationData", evacuationData);

        if (evacuationData && evacuationData.route) {
          setEvacRoute(evacuationData.route);
          setSafeRoute(null);

          // Extract route start and end points for markers
          const routeCoords = evacuationData.route.features[0].geometry.coordinates;
          if (routeCoords && routeCoords.length > 0) {
            setRouteStartPoint({
              lat: routeCoords[0][1],
              lng: routeCoords[0][0]
            });
            setRouteEndPoint({
              lat: routeCoords[routeCoords.length - 1][1],
              lng: routeCoords[routeCoords.length - 1][0]
            });
          }

          console.log('Evacuation route set:', evacuationData);
        } else {
          console.error('Error getting evacuation route:', error);
          Alert.alert('Error', 'Failed to get evacuation route. Please try to move away from the danger zone.');
        }
      } catch (error) {
        console.error('Error getting evacuation route:', error);
        Alert.alert('Error', 'Failed to get evacuation route. Please try to move away from the danger zone.');
      } finally {
        setRouting(false);
      }
    };

    // Get safe route to shelter for current location (only called when user exits hit area)
    const getSafeRouteForLocation = async (location) => {
      if (!shelters || shelters.length === 0) return;

      setRouting(true);
      try {
        // Convert incidents to hit areas format
        const hitAreas = incidents.map(incident => ({
          lat: incident.location.coordinates[1],
          lng: incident.location.coordinates[0],
          radius: 500 // 500m radius for each incident
        }));

        const safeRouteData = await getSafeRouteToShelter(location, shelters, hitAreas);

        if (safeRouteData && safeRouteData.route) {
          console.log('safe route: ', safeRouteData)
          setSafeRoute(safeRouteData.route);
          safeRouteRef.current = safeRouteData.route;
          setEvacRoute(null);

          // Extract route start point for shelter route
          const routeCoords = safeRouteData.route.features[0].geometry.coordinates;
          if (routeCoords && routeCoords.length > 0) {
            console.log('route coods: ', routeCoords);
            setRouteStartPoint({
              lat: routeCoords[0][1],
              lng: routeCoords[0][0]
            });
            // End point is the shelter location
            setRouteEndPoint({
              lat: safeRouteData.shelter.location.coordinates[1],
              lng: safeRouteData.shelter.location.coordinates[0]
            });
          }

          console.log('Safe route set:', safeRouteData);
        } else {
          // Clear route markers if no route found
          setRouteStartPoint(null);
          setRouteEndPoint(null);
        }
      } catch (error) {
        console.error('Error getting safe route:', error);
        Alert.alert('Error', 'Failed to get safe route to shelter.');
      } finally {
        setRouting(false);
      }
    };

    // Reset routes function (for manual recalculation if needed)
    const resetRoutes = () => {
      setEvacRoute(null);
      setSafeRoute(null);
      setRouteCalculated(false);
      setHasExitedHitArea(false);
      hasExitedHitAreaRef.current = false;
      routeCalculatedRef.current = false;
      initialLocationRef.current = null;

      // Reinitialize with current location
      const currentLoc = { lat: currentLocation.lat, lng: currentLocation.lng };
      initialLocationRef.current = currentLoc;
      setInitialLocation(currentLoc);

      const initializeRoute = async () => {
        try {
          const hitAreas = incidents.map(incident => ({
            lat: incident.location.coordinates[1],
            lng: incident.location.coordinates[0],
            radius: 500
          }));

          const inHit = isInHitArea(currentLoc.lat, currentLoc.lng, hitAreas);
          setIsInHitAreaState(inHit);

          if (inHit) {
            await getEvacuationRouteForLocation(currentLoc);
          } else {
            setSafeRoute(null);
            setRouteStartPoint(null);
            setRouteEndPoint(null);
          }

          routeCalculatedRef.current = true;
          setRouteCalculated(true);
        } catch (error) {
          console.error('Error reinitializing route:', error);
        }
      };

      initializeRoute();
    };

    // Cleanup location tracking on unmount
    useEffect(() => {
      startLiveTracking();

      return () => {
        stopLiveTracking();
      };
    }, []);

    // Calculate zoom level from region
    const getZoomLevel = region => {
      const angle = region.longitudeDelta;
      const zoom = Math.round(Math.log(360 / angle) / Math.LN2);
      setZoomLevel(zoom);
      return zoom;
    };

    // Calculate marker size based on zoom level
    const getMarkerSize = zoom => {
      const minSize = 20;
      const maxSize = 40;
      const minZoom = 10;
      const maxZoom = 20;

      const clampedZoom = Math.max(minZoom, Math.min(zoom, maxZoom));
      return (
        minSize +
        ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize)
      );
    };

    return (
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
          zoomControlEnabled={true}
          zoomEnabled={true}
          scrollEnabled={true}
          onRegionChangeComplete={region => {
            const zoom = getZoomLevel(region);
            setZoomLevel(zoom);
            setMarkerSize(getMarkerSize(zoom));
            console.log(
              `Zoom Level: ${zoom}, Marker Size: ${getMarkerSize(zoom)}`,
            );
          }}
        >
          {/* Shelter Markers */}
          {shelters
            .filter(shelter => {
              const shelterLat = shelter.location.coordinates[1];
              const shelterLng = shelter.location.coordinates[0];

              // Check if this shelter is within 500m of any incident
              const isNearAnyIncident = incidents.some(incident => {
                const incidentLat = incident.location.coordinates[1];
                const incidentLng = incident.location.coordinates[0];
                return isWithinDistance(
                  shelterLat,
                  shelterLng,
                  incidentLat,
                  incidentLng,
                  500, // 500 meters
                );
              });

              // Keep shelter only if it's NOT near any incident
              return !isNearAnyIncident;
            })
            .map((shelter, index) => (
              <Marker
                key={`shelter-${index}`}
                coordinate={{
                  latitude: shelter.location.coordinates[1],
                  longitude: shelter.location.coordinates[0],
                }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <ShelterMarker size={markerSize} />
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{shelter.title}</Text>
                    {shelter.capacity && (
                      <Text style={styles.calloutText}>
                        Capacity: {shelter.capacity}
                      </Text>
                    )}
                    <Text style={styles.calloutLabel}>Safe Zone</Text>
                  </View>
                </Callout>
              </Marker>
            ))}

          {/* Incident Markers */}
          {incidents.map((incident, index) => {
            const coords = {
              latitude: incident.location.coordinates[1],
              longitude: incident.location.coordinates[0],
            };

            return (
              <React.Fragment key={`incident-${index}`}>
                <Marker coordinate={coords} anchor={{ x: 0.5, y: 0.5 }}>
                  <IncidentMarker size={markerSize} />
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>
                        Emergency Incident
                      </Text>
                      <Text style={[styles.calloutText, styles.typeText]}>
                        Type:{' '}
                        {types.find(type => type._id === incident.typeId)
                          ?.name || 'Unknown'}
                      </Text>
                      <Text style={styles.calloutText}>
                        {incident.description}
                      </Text>
                      <Text style={[styles.calloutText, styles.severityText]}>
                        Severity: {incident.severity}
                      </Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Danger zone circle */}
                <Circle
                  center={coords}
                  radius={500}
                  strokeWidth={2}
                  strokeColor="rgba(255,0,0,0.7)"
                  fillColor="rgba(255,0,0,0.2)"
                />
              </React.Fragment>
            );
          })}

          {/* User Locations Markers */}
          {userLocations.map((location, index) => {
            const coords = {
              latitude: location.location.coordinates[1],
              longitude: location.location.coordinates[0],
            };

            return (
              <React.Fragment key={`user-location-${index}`}>
                <Marker coordinate={coords} anchor={{ x: 0.5, y: 0.5 }}>
                  <UserLocMarker size={markerSize} />
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>
                        {location.location.name || 'User Location'}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Live Location Marker - Now uses currentLocation instead of static lat/lng */}
          {currentLocation && currentLocation.lat && currentLocation.lng && (
            <Marker
              key="live-location"
              coordinate={{
                latitude: currentLocation.lat,
                longitude: currentLocation.lng
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <LiveLocationMarker size={markerSize} />
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>Your Location</Text>
                  <Text style={styles.calloutText}>You are here</Text>
                  {isInHitAreaState && (
                    <Text style={[styles.calloutText, styles.dangerText]}>
                      ⚠️ In Danger Zone
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          )}

          {/* Route Start Marker (Red for evacuation, Blue for shelter) */}
          {routeStartPoint && (
            <Marker
              coordinate={{
                latitude: routeStartPoint.lat,
                longitude: routeStartPoint.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <RouteStartMarker size={markerSize} isEvacuation={!hasExitedHitAreaRef.current} />
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {!hasExitedHitArea ? 'Evacuation Start' : 'Route Start'}
                  </Text>
                  <Text style={styles.calloutText}>
                    {!hasExitedHitArea
                      ? 'Follow the red route to safety'
                      : 'Follow the green route to shelter'
                    }
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}

          {/* Route End Marker (Green for evacuation, Blue for shelter) */}
          {routeEndPoint && (
            <Marker
              coordinate={{
                latitude: routeEndPoint.lat,
                longitude: routeEndPoint.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <RouteEndMarker size={markerSize} isEvacuation={!hasExitedHitAreaRef.current} />
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {!hasExitedHitArea ? 'Safe Zone' : 'Shelter'}
                  </Text>
                  <Text style={styles.calloutText}>
                    {!hasExitedHitArea
                      ? 'You will be safe here'
                      : 'Emergency shelter location'
                    }
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}

          {/* Evacuation Route (Red Polyline) */}
          {evacRoute && evacRoute.features && evacRoute.features[0] && (
            <Polyline
              coordinates={evacRoute.features[0].geometry.coordinates.map(coord => ({
                latitude: coord[1],
                longitude: coord[0],
              }))}
              strokeColor="#FF0000"
              strokeWidth={4}
            />
          )}

          {/* Safe Route to Shelter (Green Polyline) - Show when shelter route exists */}
          {safeRoute && safeRoute.features && safeRoute.features[0] && (
            <Polyline
              coordinates={safeRoute.features[0].geometry.coordinates.map(coord => ({
                latitude: coord[1],
                longitude: coord[0],
              }))}
              strokeColor="#00FF00"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Status Indicator */}
        {isInHitAreaState && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              ⚠️ You are in a danger zone! Follow the red route to evacuate.
            </Text>
          </View>
        )}

        {routing && (
          <View style={styles.routingContainer}>
            <Text style={styles.routingText}>Calculating route...</Text>
          </View>
        )}

        {/* Shelter Navigation Prompt */}
        {showShelterNavigationPrompt && (
          <View style={styles.shelterPromptOverlay}>
            <View style={styles.shelterPromptContainer}>
              <Text style={styles.shelterPromptTitle}>You're Safe!</Text>
              <Text style={styles.shelterPromptText}>
                You've successfully evacuated the danger zone! Would you like directions to the nearest emergency shelter?
              </Text>
              <View style={styles.shelterPromptButtons}>
                <Text
                  style={[styles.shelterPromptButton, styles.shelterPromptButtonPrimary]}
                  onPress={async () => {
                    setShowShelterNavigationPrompt(false);
                    await getSafeRouteForLocation(currentLocation);
                  }}
                >
                  Yes, Show Route
                </Text>
                <Text
                  style={[styles.shelterPromptButton, styles.shelterPromptButtonSecondary]}
                  onPress={() => setShowShelterNavigationPrompt(false)}
                >
                  No, Thanks
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Manual route recalculation button */}
        {routeCalculated && !routing && (isInHitAreaState || (safeRouteRef.current)) && (
          <View style={styles.recalculateContainer}>
            <Text style={styles.recalculateText} onPress={resetRoutes}>
              Recalculate Route
            </Text>
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.latitude === nextProps.latitude &&
      prevProps.longitude === nextProps.longitude &&
      prevProps.shelters?.length === nextProps.shelters?.length &&
      prevProps.incidents?.length === nextProps.incidents?.length &&
      prevProps.userLocations?.length === nextProps.userLocations?.length &&
      prevProps.setLocation === nextProps.setLocation
    );
  },
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Marker text styles
  markerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Shadow for all markers
  markerShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 999,
    top: 2,
    left: 0,
    zIndex: -1,
  },
  // Callout styles
  calloutContainer: {
    minWidth: 150,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  calloutLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  severityText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  typeText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  // Status indicator styles
  statusContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  routingContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  routingText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  recalculateContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  recalculateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Shelter navigation prompt styles
  shelterPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  shelterPromptContainer: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    minWidth: 280,
  },
  shelterPromptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 15,
  },
  shelterPromptText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  shelterPromptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shelterPromptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    overflow: 'hidden',
  },
  shelterPromptButtonPrimary: {
    backgroundColor: '#4CAF50',
    color: '#ffffff',
  },
  shelterPromptButtonSecondary: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
});

export default DisasterMap;
