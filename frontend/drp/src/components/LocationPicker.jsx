import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';
import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
// import { LocationService } from '../services/LocationService';
import { getCurrentLocation } from '../services/location/locationService';

const LocationPicker = ({ visible, onClose, onLocationSelected, editingLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveLoc, setLiveLoc] = useState(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const hasPermission = await checkAndRequestLocationPermission();
        if (!hasPermission) {
          setError('Location permission denied');
          setIsLocLoading(false);
          onClose();
          return;
        }

        // Get current location
        const location = await getCurrentLocation();

        setLiveLoc({
          latitude: location?.latitude ?? 34, // Fallback to 34 if null
          longitude: location?.longitude ?? 35 // Fallback to 35 if null
        });
        setIsLocLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLocLoading(false);
        setLiveLoc({ latitude: 34, longitude: 35 }); // Guaranteed fallback
        onClose();
      }
    };

    if (visible) {
      initializeLocation();
    }
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      if (editingLocation) {
        // Editing existing location
        setSelectedLocation({
          latitude: editingLocation.coordinates[1],
          longitude: editingLocation.coordinates[0]
        });
        setLocationName(editingLocation.name);
        setAddress(editingLocation.address || '');
      } else if (liveLoc && liveLoc.latitude && liveLoc.longitude) {
        // Adding new location - use current live location
        setSelectedLocation({
          latitude: liveLoc.latitude,
          longitude: liveLoc.longitude
        });
        setLocationName('');
        setAddress('');
      }
    }
  }, [visible, liveLoc, editingLocation]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation || !selectedLocation.latitude || !selectedLocation.longitude || !locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name or select a valid location on the map');
      return;
    }

    setIsLoading(true);
    try {
      const addressText = await getCountryNameFromCoords(
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      setAddress(addressText);

      const locationData = {
        name: locationName.trim(),
        coordinates: [selectedLocation.longitude, selectedLocation.latitude],
        address: addressText
      };

      onLocationSelected(locationData);
      onClose();
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Failed to get address for the selected location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedLocation(null);
    setLocationName('');
    setAddress('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{editingLocation ? 'Edit Location' : 'Select Location'}</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter location name (e.g., Home, Work)"
            value={locationName}
            onChangeText={setLocationName}
            maxLength={50}
          />
        </View>

        <View style={styles.mapContainer}>
          {isLocLoading ? (
            // Show loader while location is loading
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: editingLocation ? editingLocation.coordinates[1] : (liveLoc && liveLoc.latitude) ? liveLoc.latitude : 0,
                longitude: editingLocation ? editingLocation.coordinates[0] : (liveLoc && liveLoc.longitude) ? liveLoc.longitude : 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
            >
              {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
                <Marker
                  coordinate={selectedLocation}
                  title="Selected Location"
                  description={locationName || 'Location'}
                  pinColor="red"
                />
              )}
            </MapView>
          )}
        </View>

        {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
            {address && <Text style={styles.addressText}>{address}</Text>}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirmLocation}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Processing...' : (editingLocation ? 'Update Location' : 'Confirm Location')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  inputContainer: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationPicker; 