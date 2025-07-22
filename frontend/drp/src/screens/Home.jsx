import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
import { getCurrentLocation } from "../services/location/locationService";
import Feather from 'react-native-vector-icons/Feather';
import { getCountryNameFromCoords } from "../services/geocoding/geocodingService";
import LocationMap from "../services/map/mapService";
import InHitArea from "../services/hitArea/inHitArea";

export default function Home() {

  const safetyQuotes = [
    "Safety doesn’t happen by accident.",
    "Stay alert. Stay alive.",
    "Be aware of your surroundings at all times.",
    "Always have an emergency plan — and practice it.",
    "Don’t assume others will be cautious for you.",
    "If it feels unsafe, it probably is. Trust your instincts.",
    "Plan ahead — emergencies don’t send invites.",
    "Learn from near misses — they’re warning signs.",
    "Complacency kills. Keep safety routines fresh.",
    "Document hazards before they become disasters.",
    "Precaution is better than cure. – Edward Coke",
    "Keep walkways clear to prevent trips and falls.",
    "Check fire extinguishers and smoke detectors regularly.",
    "Label hazardous materials clearly.",
    "Report unsafe conditions immediately.",
    "Don’t bypass safety equipment — it’s there for a reason.",
    "Lock up tools and chemicals away from children.",
    "Always wear the right protective gear for the job.",
    "Electrical cords shouldn’t run under rugs or across walkways.",
    "Store heavy items on lower shelves to prevent falling hazards.",
    "Keep a 'go bag' with essentials for emergencies.",
    "Know local emergency numbers — and teach them to kids.",
    "Secure tall furniture and heavy items in earthquake-prone areas.",
    "Floods coming? Move valuables to higher ground early.",
    "Make copies of important documents and store them digitally.",
    "Hope for the best, prepare for the worst.",
    "Practice fire and evacuation drills twice a year.",
    "Have a meeting point for family after disasters.",
    "Back up important data — digitally and physically.",
    "Stay informed through trusted emergency alert systems."
  ];

  const [randomQuote, setRandomQuote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRandomQuote(safetyQuotes[Math.floor(Math.random() * safetyQuotes.length)]);
  }, []);

  useEffect(() => {
    async function fetchLocation() {
      setLoading(true);
      setError(null);
      const hasPermission = await checkAndRequestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
        const name = await getCountryNameFromCoords(loc.latitude, loc.longitude);
        setLocationName(name);
      } else {
        setError('Failed to fetch location');
      }
      setLoading(false);
    }
    fetchLocation();
  }, []);

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
              />
            )}
            <Status />
            <Quote key={randomQuote} text={randomQuote} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Header = () => (
  <View style={styles.header}>
    <Feather name="map-pin" size={60} color="green" style={styles.icon} />
    <Text style={styles.locationName}>Where I Am?</Text>
  </View>
);

const Status = () => {
  const [isSafe, setIsSafe] = useState(null);

  useEffect(() => {
    const check = async () => {
      const result = await InHitArea();
      setIsSafe(result);
    };
    check();
  }, []);

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
