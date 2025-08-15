import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getNotifications } from '../api/NotificationApi';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';
import Feather from 'react-native-vector-icons/Feather';
// import colors from '../constants/colors';
import { useTheme } from '../hooks/useThem';


const NotificationScreen = () => {
  const { colors, isDarkMode } = useTheme(); 

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
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 40,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: colors.blueGray,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.orange,
    marginLeft: 6,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severity: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: colors.textColor,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textColor,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const userId = useSelector(state => state.user.userId);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (!userId) {
        console.error('No userId available');
        setNotifications([]);
        return;
      }

      const rawData = await getNotifications(userId);
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
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [userId])
  );

  const handlePress = (notification) => {
    navigation.navigate('NotificationDetails', { notification });
  };

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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.cardContainer}>
      <View style={styles.notificationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={16} color={colors.orange} />
            <Text style={styles.location}>{item.locationName}</Text>
          </View>
          <View style={styles.severityContainer}>
            <Feather 
              name={getSeverityIcon(item.severity)} 
              size={16} 
              color={getSeverityColor(item.severity)} 
            />
            <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
              {item.severity}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.date}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Feather name="bell" size={28} color={colors.orange} />
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <Text style={styles.headerSubtitle}>Stay informed about incidents</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.darkerBlueGray} />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkerBlueGray} />
      <View style={styles.container}>
        <Header />
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="bell-off" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>You're all caught up! No new notifications available.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};


export default NotificationScreen;