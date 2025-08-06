import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getNotifications } from '../api/NotificationApi';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const rawData = await getNotifications();
      rawData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const enrichedData = await Promise.all(
        rawData.map(async (item) => {
          const coords = item.location.coordinates;
          let locationName = 'Unknown location';

          if (coords && coords[0] && coords[1]) {
            locationName = await getCountryNameFromCoords(coords[1], coords[0]);
          }

          return {
            ...item,
            locationName,
          };
        })
      );

      setNotifications(enrichedData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // const handlePress = (notification) => {
  // };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.notificationCard}>
        <Text style={styles.location}>{item.locationName}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.row}>
          <Text style={styles.severity}>{item.severity}</Text>
          <Text style={styles.date}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No notifications available.</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  location: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cc0000',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default NotificationScreen;
