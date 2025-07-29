import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import LocationPicker from '../components/LocationPicker';
import { registerUser } from '../api/AuthApi';
import { getUserById } from '../api/UserApi';
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useDispatch, useSelector } from 'react-redux';
import { updateUserDetails } from '../redux/UserSlice';
import { addLocation, removeLocation, updateLocation, clearSignupData } from '../redux/signupLocationsSlice';
import { showSuccessToast } from '../utils/toast';

const LocationSelection = ({ navigation, route }) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const dispatch = useDispatch();

  // Get locations and user data from Redux state
  const { locations, userData } = useSelector((state) => state.signupLocations);
  const { setIsLoggedIn } = route.params;

  const handleLocationSelected = (locationData) => {
    if (editingLocationIndex !== null) {
      // Editing existing location
      dispatch(updateLocation({ index: editingLocationIndex, location: locationData }));
      setEditingLocationIndex(null);
    } else {
      // Adding new location
      if (locations.length >= 3) {
        Alert.alert('Maximum Locations', 'You can only add up to 3 locations');
        return;
      }
      dispatch(addLocation(locationData));
    }
  };

  const handleRemoveLocation = (index) => {
    dispatch(removeLocation(index));
  };

  const handleEditLocation = (index) => {
    setShowLocationPicker(true);
    setEditingLocationIndex(index);
  };

  const handleSubmit = async () => {
    if (locations.length === 0) {
      Alert.alert('No Locations', 'Please add at least one location to continue');
      return;
    }

    if (!userData) {
      Alert.alert('Error', 'User data not found. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register user with locations included
      const registerData = {
        ...userData,
        locations: locations.map(location => ({
          type: "Point",
          name: location.name,
          coordinates: location.coordinates
        }))
      };

      const res = await registerUser(registerData);
      console.log("Signup response:", res);

      if (!res || !res.token) {
        Alert.alert('Signup failed', 'Invalid response from server');
        return;
      }

      await AsyncStorage.setItem('token', res.token);

      const decoded = jwtDecode(res.token);
      console.log("user ", decoded, " ", res.token);

      // Fetch user details and update Redux
      try {
        const userDetails = await getUserById(decoded.id);
        dispatch(updateUserDetails({
          fname: userDetails.fname,
          lname: userDetails.lname,
          email: userDetails.email
        }));
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      // Clear signup data from Redux
      dispatch(clearSignupData());

      // Set login state and navigate to main app
      setIsLoggedIn(true);
      showSuccessToast('Signup successful!');

    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Your Locations</Text>
        <Text style={styles.subtitle}>
          Enter at least one location to be notified if a disaster happens nearby
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.locationsContainer}>
          {locations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
                <Text style={styles.locationCoords}>
                  {location.coordinates && location.coordinates[1] && location.coordinates[0]
                    ? `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`
                    : 'Coordinates not available'
                  }
                </Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditLocation(index)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveLocation(index)}
                >
                  <Text style={styles.actionButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {locations.length < 3 && (
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.addLocationText}>+ Add Location</Text>
            </TouchableOpacity>
          )}

          {locations.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No locations added yet. Tap the button above to add your first location.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>

        <TouchableOpacity
          style={[
            styles.submitButton, 
            (isSubmitting || locations.length === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || locations.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Setting up your account...' : 'Complete Signup'}
          </Text>
        </TouchableOpacity>
      </View>

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => {
          setShowLocationPicker(false);
          setEditingLocationIndex(null);
        }}
        onLocationSelected={handleLocationSelected}
        editingLocation={editingLocationIndex !== null ? locations[editingLocationIndex] : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  locationsContainer: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addLocationButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  clearAllButton: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationSelection; 