import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../hooks/useThem';
import IncidentMap from '../services/map/incidentMap';
const NotificationDetails = ({ route }) => {
  const { colors } = useTheme();
  const { notification } = route.params;

  const coords = notification.location.coordinates;
  const latitude = coords[1];
  const longitude = coords[0];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.darkerBlueGray,
    },
    container: {
      flex: 1,
      backgroundColor: colors.darkerBlueGray,
    },
    header: {
      backgroundColor: colors.darkestBlueGray,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.blueGray,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textColor,
      marginLeft: 12,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    mapCard: {
      backgroundColor: colors.blueGray,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    mapHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    mapTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textColor,
      marginLeft: 8,
    },
    mapWrapper: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      height: 300,
    },
    detailsCard: {
      backgroundColor: colors.blueGray,
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
      color: colors.textColor,
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
      color: colors.textSecondary,
      marginLeft: 8,
    },
    detailValue: {
      fontSize: 16,
      color: colors.textColor,
      lineHeight: 22,
      marginLeft: 28,
    },
    safetyCard: {
      backgroundColor: colors.blueGray,
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
      color: colors.textColor,
      lineHeight: 22,
    },
  });

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return colors.red;
      case 'medium':
        return '#FF9800';
      case 'low':
        return colors.green;
      default:
        return colors.textSecondary;
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
        <Feather name="file-text" size={28} color={colors.orange} />
        <Text style={styles.headerTitle}>Incident Details</Text>
      </View>
    </View>
  );

  const DetailItem = ({ icon, label, value, color = colors.textColor }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailHeader}>
        <Feather name={icon} size={20} color={colors.orange} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.darkerBlueGray}
      />
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Feather name="map" size={24} color={colors.orange} />
              <Text style={styles.mapTitle}>Incident Location</Text>
            </View>
            <View style={styles.mapWrapper}>
              <IncidentMap
  latitude={latitude}
  longitude={longitude}
  title={notification.locationName || 'Incident Location'}
  height={300}
  width="100%"
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
              color={colors.orange}
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
              value={notification.typeId?.name || 'N/A'}
            />

            <DetailItem
              icon="clock"
              label="Date & Time"
              value={new Date(notification.timestamp).toLocaleString()}
            />
          </View>

          <View style={styles.safetyCard}>
            <View style={styles.cardHeader}>
              <Feather name="shield" size={24} color={colors.orange} />
              <Text style={styles.cardTitle}>Safety Information</Text>
            </View>
            <Text style={styles.safetyText}>
              Please follow local emergency instructions and stay informed about
              updates regarding this incident.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NotificationDetails;
