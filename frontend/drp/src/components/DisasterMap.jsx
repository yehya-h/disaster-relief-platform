import React, { use, useState } from 'react';
import MapView, {
  Marker,
  Circle,
  Callout,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { Text, View, StyleSheet } from 'react-native';
import { isWithinDistance } from '../services/location/distanceService';
import { useSelector } from 'react-redux';

const DisasterMap = React.memo(({ shelters, incidents, latitude, longitude }) => {
  const [zoomLevel, setZoomLevel] = useState(15);
  const [markerSize, setMarkerSize] = useState(24); // Default marker size
  const types = useSelector(state => state.incidentTypes.incidentTypes);

  // Calculate zoom level from region
  const getZoomLevel = region => {
    const angle = region.longitudeDelta;
    const zoom = Math.round(Math.log(360 / angle) / Math.LN2);
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

  // Professional marker components
  const ShelterMarker = ({ size }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
      <View style={[styles.shelterMarker, { width: size, height: size }]}>
        <View style={styles.shelterIcon}>
          <Text style={[styles.markerText, { fontSize: size * 0.4 }]}>S</Text>
        </View>
      </View>
      <View style={[styles.markerShadow, { width: size, height: size }]} />
    </View>
  );

  const IncidentMarker = ({ size }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
      <View style={[styles.incidentMarker, { width: size, height: size }]}>
        <View style={styles.incidentIcon}>
          <Text style={[styles.markerText, { fontSize: size * 0.4 }]}>!</Text>
        </View>
      </View>
      <View style={[styles.markerShadow, { width: size, height: size }]} />
    </View>
  );

  const LiveLocationMarker = ({ size = 24 }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
      <View style={[styles.liveMarker, { width: size, height: size }]}>
        <View style={[styles.liveMarkerInner, { 
          width: size * 0.6, 
          height: size * 0.6 
        }]} />
      </View>
      <View style={[styles.liveMarkerPulse, { width: size * 1.5, height: size * 1.5 }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
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
          console.log(`Zoom Level: ${zoom}, Marker Size: ${getMarkerSize(zoom)}`);
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
                500 // 500 meters
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
              <Marker
                coordinate={coords}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <IncidentMarker size={markerSize} />
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>Emergency Incident</Text>
                    <Text style={[styles.calloutText, styles.typeText]}>
                      Type: {types.find(type => type._id === incident.typeId)?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.calloutText}>{incident.description}</Text>
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

        {/* Live Location Marker */}
        {latitude && longitude && (
          <Marker
            key="live-location"
            coordinate={{ latitude, longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <LiveLocationMarker size={markerSize} />
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Your Location</Text>
                <Text style={styles.calloutText}>You are here</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.latitude === nextProps.latitude &&
    prevProps.longitude === nextProps.longitude &&
    prevProps.shelters?.length === nextProps.shelters?.length &&
    prevProps.incidents?.length === nextProps.incidents?.length
  );
});

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
  // Shelter marker styles
  shelterMarker: {
    backgroundColor: '#4CAF50', // Green
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shelterIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Incident marker styles
  incidentMarker: {
    backgroundColor: '#F44336', // Red
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incidentIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Live location marker styles
  liveMarker: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  liveMarkerInner: {
    backgroundColor: '#007AFF',
    borderRadius: 999,
  },
  liveMarkerPulse: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 999,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -0.75 }, { translateY: -0.75 }],
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
});

export default DisasterMap;