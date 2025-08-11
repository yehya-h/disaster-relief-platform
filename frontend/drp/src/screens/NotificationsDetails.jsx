import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import DisasterMap from '../components/DisasterMap';
import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/colors';

const NotificationDetails = ({ route }) => {
  const { notification } = route.params;
  const coords = notification.location.coordinates;
  const latitude = coords[1];
  const longitude = coords[0];

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return '#FF9800';
      case 'low':
        return Colors.green;
      default:
        return Colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'alert-triangle';
      case 'medium':
        return 'alert-circle';
      case 'low':
        return 'info';
      default:
        return 'bell';
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Feather name="file-text" size={28} color={Colors.orange} />
        <Text style={styles.headerTitle}>Incident Details</Text>
      </View>
    </View>
  );

  const DetailItem = ({ icon, label, value, color = Colors.textColor }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailHeader}>
        <Feather name={icon} size={20} color={Colors.orange} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkerBlueGray} />
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Feather name="map" size={24} color={Colors.orange} />
              <Text style={styles.mapTitle}>Incident Location</Text>
            </View>
            {/* Wrap DisasterMap to handle borderRadius clipping */}
            <View style={styles.mapWrapper}>
              <DisasterMap
                incidents={[notification]}
                latitude={latitude}
                longitude={longitude}
                shelters={[]}
                userLocations={[]}
                setLocation={() => {}}
              />
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Incident Information</Text>
            </View>

            <DetailItem
              icon="map-pin"
              label="Location"
              value={notification.locationName}
              color={Colors.orange}
            />

            <DetailItem
              icon="file-text"
              label="Description"
              value={notification.description}
            />

            <DetailItem
              icon={getSeverityIcon(notification.severity)}
              label="Severity"
              value={notification.severity}
              color={getSeverityColor(notification.severity)}
            />

            <DetailItem
              icon="tag"
              label="Type"
              value={notification.typeId.name || 'N/A'}
            />

            <DetailItem
              icon="clock"
              label="Date & Time"
              value={new Date(notification.timestamp).toLocaleString()}
            />
          </View>

          <View style={styles.safetyCard}>
            <View style={styles.cardHeader}>
              <Feather name="shield" size={24} color={Colors.orange} />
              <Text style={styles.cardTitle}>Safety Information</Text>
            </View>
            <Text style={styles.safetyText}>
              Please follow local emergency instructions and stay informed about updates regarding this incident.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkerBlueGray,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.darkerBlueGray,
  },
  header: {
    backgroundColor: Colors.darkestBlueGray,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blueGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // important for clipping children on Android
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textColor,
    marginLeft: 8,
  },
  // wrapper for DisasterMap to clip to borderRadius
  mapWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300, // fix height to avoid collapsing container
  },
  detailsCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: Colors.textColor,
    marginLeft: 8,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textColor,
    lineHeight: 22,
    marginLeft: 28,
  },
  safetyCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  safetyText: {
    fontSize: 16,
    color: Colors.textColor,
    lineHeight: 22,
  },
});

export default NotificationDetails;
