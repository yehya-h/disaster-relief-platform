import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';

import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
import { getCurrentLocation } from "../services/location/locationService";
import { getCountryNameFromCoords } from "../services/geocoding/geocodingService";
import LocationMap from "../services/map/mapService";
import { inHitArea, getIncident } from "../services/hitArea/inHitArea";
import { useTheme } from '../hooks/useThem';
import { useSelector } from 'react-redux';

export default function Home() {
  const { colors, isDarkMode } = useTheme(); 
  
  // Always call hooks at the top level
  const userRole = useSelector(state => state.user.role);
  
  // Always call useDrawerStatus, but handle the case where drawer might not exist
  let drawerStatus = null;
  try {
    drawerStatus = useDrawerStatus();
  } catch (error) {
    // If drawer navigator is not available, drawerStatus will remain null
    console.log('Drawer navigator not available');
  }

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.darkerBlueGray,
    },
    container: {
      flex: 1,
      backgroundColor: colors.darkerBlueGray,
    },
    content: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 10,
    },
    headerIconContainer: {
      alignSelf: 'center',
      marginBottom: 10,
      backgroundColor: colors.darkestBlueGray,
      padding: 14,
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
      alignItems: 'center',
    },
    headerIconText: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.red,
      textAlign: 'center',
    },
    retryText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.orange,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      margin: 8,
    },
    locationName: {
      fontSize: 28,
      fontWeight: '500',
      color: colors.textColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    mapCard: {
      backgroundColor: colors.blueGray,
      borderRadius: 14,
      padding: 16,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    mapHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    mapTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textColor,
      marginLeft: 8,
    },
    statusCard: {
      backgroundColor: colors.blueGray,
      borderRadius: 14,
      padding: 16,
      marginBottom: 18,
      borderLeftWidth: 5,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    statusText: {
      fontSize: 16,
      color: colors.textColor,
      lineHeight: 22,
    },
    statusLoadingText: {
      marginTop: 8,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    simpleTipText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 22,
      textAlign: 'center',
      opacity: 0.85,
      paddingBottom: 20
    },
  }); 

  const Status = ({ isSafe, types }) => {
    if (isSafe === null) {
      return (
        <View style={styles.statusCard}>
          <ActivityIndicator size="small" color={colors.orange} />
          <Text style={styles.statusLoadingText}>Checking area status...</Text>
        </View>
      );
    }

    const statusColor = isSafe ? colors.green : colors.red;
    const statusIcon = isSafe ? 'check-circle' : 'alert-triangle';
    const statusText = isSafe
      ? 'You are in a safe area.'
      : `You're in an affected area: ${types.join(', ')}. Stay safe.`;

    return (
      <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
        <View style={styles.statusHeader}>
          <Feather name={statusIcon} size={24} color={statusColor} />
          <Text style={[styles.statusTitle, { color: statusColor }]}>
            {isSafe ? 'Safe Area' : 'Affected Area'}
          </Text>
        </View>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  const defaultTips = [
    "Safety doesn't happen by accident.",
    "Stay alert. Stay alive.",
    "Safety first is safety always.",
    "Your safety is our priority.",
  ];

  const [randomQuote, setRandomQuote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hitAreas, setHitAreas] = useState([]);
  const [isSafe, setIsSafe] = useState(null);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [safetyTips, setSafetyTips] = useState([]);
  const [mapKey, setMapKey] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);

  // Handle drawer status changes only if drawer is available and user role allows it
  useEffect(() => {
    if (
      userRole !== undefined && 
      userRole !== null && 
      userRole !== 1 && 
      drawerStatus === 'closed'
    ) {
      setMapKey(prev => prev + 1);
    }
  }, [drawerStatus, userRole]);

  useEffect(() => {
    if (safetyTips.length > 0) {
      setRandomQuote(
        safetyTips[Math.floor(Math.random() * safetyTips.length)]
      );
    } else {
      setRandomQuote(
        defaultTips[Math.floor(Math.random() * defaultTips.length)]
      );
    }
  }, [safetyTips]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchLocationData() {
        try {
          setLoading(true);
          setError(null);
          const hasPermission = await checkAndRequestLocationPermission();
          if (!hasPermission) {
            if (isActive) {
              setError('Location permission denied');
              setLoading(false);
            }
            return;
          }
          const loc = await getCurrentLocation();
          if (!loc) {
            if (isActive) {
              setError('Failed to fetch location');
              setLoading(false);
            }
            return;
          }
          if (!isActive) return;
          setLocation(loc);
          const name = await getCountryNameFromCoords(loc.latitude, loc.longitude);
          if (isActive) setLocationName(name);
          const isInHitArea = await inHitArea(loc.longitude, loc.latitude);
          if (!isActive) return;
          setIsSafe(!isInHitArea);
          if (isInHitArea) {
            const incidents = await getIncident(loc.longitude, loc.latitude);
            if (isActive && Array.isArray(incidents) && incidents.length > 0) {
              const types = incidents.map(i => i.typeId?.name).filter(Boolean);
              const tips = incidents.flatMap(i => i.typeId?.safetyTips || []);
              setIncidentTypes([...new Set(types)]);
              setSafetyTips([...new Set(tips)]);
            } else if (isActive) {
              setIncidentTypes([]);
              setSafetyTips(defaultTips);
            }
          } else if (isActive) {
            setIncidentTypes([]);
            setSafetyTips(defaultTips);
          }
          if (isActive) {
            setLoading(false);
            setMapKey(prev => prev + 1);
          }
        } catch {
          if (isActive) {
            setError('Failed to load location data. Please try again.');
            setLoading(false);
          }
        }
      }
      fetchLocationData();
      return () => {
        isActive = false;
      };
    }, [refreshTrigger])
  );

  useFocusEffect(
    useCallback(() => {
      setMapKey(prev => prev + 1);
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 100);
      return () => {
        clearTimeout(timer);
        setIsMapReady(false);
      };
    }, [])
  );

  const refreshLocationData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkerBlueGray} />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.orange} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={colors.red} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={refreshLocationData}>
              Tap to retry
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.locationHeader}>
              <Feather name="map-pin" size={45} color={colors.orange} />
            </View>
            <Text style={styles.locationName}>{locationName}</Text>

            {location?.latitude && location?.longitude && isMapReady && (
              <View style={styles.mapCard}>
                <View style={styles.mapHeader}>
                  <Feather name="map" size={24} color={colors.orange} />
                  <Text style={styles.mapTitle}>Area Map</Text>
                </View>
                <LocationMap
                  key={mapKey}
                  latitude={location.latitude}
                  longitude={location.longitude}
                  height={300}
                  width={'100%'}
                  regionName={locationName}
                  hitAreas={hitAreas}
                />
              </View>
            )}

            <Status isSafe={isSafe} types={incidentTypes} />
            <Text style={styles.simpleTipText}>{randomQuote}</Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}