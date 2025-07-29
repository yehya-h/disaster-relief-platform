import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';

const LocationPicker = ({ visible, onClose, onLocationSelected, editingLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const liveLoc = useSelector((state) => state.liveLoc.liveLoc);

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