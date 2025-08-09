import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
import { getCurrentLocation } from "../services/location/locationService";
import Feather from 'react-native-vector-icons/Feather';
import { getCountryNameFromCoords } from "../services/geocoding/geocodingService";
import LocationMap from "../services/map/mapService";
import { inHitArea, getIncident } from "../services/hitArea/inHitArea";

export default function Home() {
  const safetyQuotes = [
    "Safety doesn’t happen by accident.",
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
  const [isSafe, setIsSafe] = useState(null); // Added state for safety status

  useEffect(() => {
    setRandomQuote(safetyQuotes[Math.floor(Math.random() * safetyQuotes.length)]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchLocation() {
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
        if (loc && isActive) {
          setLocation(loc);
          const name = await getCountryNameFromCoords(loc.latitude, loc.longitude);
          setLocationName(name);

          // Pass coordinates to inHitArea
          const isInHitArea = await inHitArea(loc.longitude, loc.latitude);
          setIsSafe(!isInHitArea); // Update safety status
          
          if (isInHitArea) {
            // Pass coordinates to getIncident
            const incidents = await getIncident(loc.longitude, loc.latitude);
            setHitAreas(incidents || []);
          } else {
            setHitAreas([]);
          }
        } else if (isActive) {
          setError('Failed to fetch location');
        }

        if (isActive) {
          setLoading(false);
        }
      }

      fetchLocation();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />
        {loading ? (
          <ActivityIndicator size="large" color="green" style={{ marginVertical: 16 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>{locationName}</Text>
            {location?.latitude && location?.longitude && (
              <LocationMap
                latitude={location.latitude}
                longitude={location.longitude}
                height={300}
                width={'80%'}
                regionName={locationName}
                hitAreas={hitAreas}
              />
            )}
            {/* Pass safety status to Status component */}
            <Status isSafe={isSafe} />
            <Quote key={randomQuote} text={randomQuote} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Updated Status component to accept isSafe prop
const Status = ({ isSafe }) => {
  if (isSafe === null) {
    return <ActivityIndicator size="small" color="gray" style={{ marginTop: 30 }} />;
  }

  const statusColor = isSafe ? '#0cca15ff' : '#d90a0aff';
  const statusText = isSafe
    ? 'You are in a safe area.'
    : 'You are in a disaster-hit area.';

  return (
    <View style={styles.statusContainer}>
      <Feather
        name={isSafe ? 'check-circle' : 'alert-triangle'}
        size={22}
        color={statusColor}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.safeText, { color: statusColor }]}>
        {statusText}
      </Text>
    </View>
  );
};

// Other components remain unchanged
const Header = () => (
  <View style={styles.header}>
    <Feather name="map-pin" size={60} color="green" style={styles.icon} />
    <Text style={styles.locationName}>Where Am I?</Text>
  </View>
);

const Quote = ({ text }) => (
  <Text style={styles.quote}>
    {text}
  </Text>
);


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginTop: 10,
    marginBottom: 10,
  },
  locationName: {
    fontSize: 20,
    color: '#a9a9abff',
    textAlign: 'center',
    marginBottom: 45,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  safeText: {
    fontSize: 20,
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    color: '#555',
    marginTop: 30,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
  },
});
