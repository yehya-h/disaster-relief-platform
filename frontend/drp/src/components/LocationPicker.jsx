import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';
import { checkAndRequestLocationPermission } from "../services/permissions/locationPermissionService";
import { LocationService } from '../services/LocationService';
// import colors from '../constants/colors';
import { useTheme } from '../hooks/useThem';

import Icon from 'react-native-vector-icons/Ionicons';

const LocationPicker = ({ visible, onClose, onLocationSelected, editingLocation }) => {
    const { colors, isDarkMode } = useTheme();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkestBlueGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textColor,
  },
  placeholder: {
    width: 40, // Same width as back button for center alignment
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.textColor,
    fontSize: 16,
  },
  mapSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.orange,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blueGray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textColor,
  },
  locationInfoCard: {
    backgroundColor: colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  locationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textColor,
    marginLeft: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textColor,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
  },
  confirmButton: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: colors.blueGray,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 300,
    // borderWidth: 1,
    // borderColor: colors.orange,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textColor,
    textAlign: 'center',
    marginBottom: 16,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButton: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveLoc, setLiveLoc] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showCustomAlert = (title, message) => {
    setAlertConfig({ title, message });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

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
        // const location = await getCurrentLocation();
        const locationService = LocationService.getInstance();
        const location = await locationService.getCurrentLocation();

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
      // Alert.alert('Error', 'Please enter a location name or select a valid location on the map');
      showCustomAlert('Error', 'Please enter a location name or select a valid location on the map');
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
      // Alert.alert('Error', 'Failed to get address for the selected location');
      showCustomAlert('Error', 'Failed to get address for the selected location');
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
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Icon name="close" size={24} color={colors.textColor} />
          </TouchableOpacity>
          <Text style={styles.title}>{editingLocation ? 'Edit Location' : 'Select Location'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Location Name Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Icon name="pencil-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter location name (e.g., Home, Work)"
              placeholderTextColor={colors.textSecondary}
              value={locationName}
              onChangeText={setLocationName}
              maxLength={50}
            />
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            {isLocLoading ? (
              // Show loader while location is loading
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.orange} />
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
                    pinColor={colors.orange}
                  />
                )}
              </MapView>
            )}
          </View>

          {/* Location Info Card */}
          {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
            <View style={styles.locationInfoCard}>
              <View style={styles.locationInfoHeader}>
                <Icon name="location" size={20} color={colors.orange} />
                <Text style={styles.locationInfoTitle}>Selected Location</Text>
              </View>
              <Text style={styles.coordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
              {address && <Text style={styles.addressText}>{address}</Text>}
            </View>
          )}
        </View>

        {/* Bottom Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
            onPress={handleConfirmLocation}
            disabled={isLoading}
          >
            <Text style={styles.confirmButtonText}>
              {isLoading ? 'Processing...' : (editingLocation ? 'Update Location' : 'Confirm Location')}
            </Text>
            {!isLoading && (
              <Icon name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>
        </View>

        {/* Custom Alert Modal */}
        <Modal
          visible={showAlert}
          transparent={true}
          animationType="fade"
          onRequestClose={hideAlert}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity style={styles.alertButton} onPress={hideAlert}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};


export default LocationPicker; 