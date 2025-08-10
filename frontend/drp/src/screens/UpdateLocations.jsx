import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserLocations } from '../api/UserApi';
import { updateUserDetails } from '../redux/UserSlice';
import LocationPicker from '../components/LocationPicker';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function UpdateLocations({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [locations, setLocations] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });

  useEffect(() => {
    // Initialize locations from Redux store
    if (user.locations) {
      const formattedLocations = user.locations.map(userLocation => ({
        name: userLocation.location?.name || '',
        address: userLocation.location?.address || '',
        coordinates: userLocation.location?.coordinates || [0, 0]
      }));
      setLocations(formattedLocations);
    }
  }, [user.locations]);

  const showCustomAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ title, message, onConfirm });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm();
    }
  };

  const goBack = () => {
    navigation.navigate('Profile');
  };

  const handleLocationSelected = (locationData) => {
    if (editingLocationIndex !== null) {
      // Editing existing location
      const updatedLocations = [...locations];
      updatedLocations[editingLocationIndex] = locationData;
      setLocations(updatedLocations);
      setEditingLocationIndex(null);
    } else {
      // Adding new location
      if (locations.length >= 3) {
        showCustomAlert('Maximum Locations', 'You can only have up to 3 locations');
        return;
      }
      setLocations([...locations, locationData]);
    }
  };

  const handleRemoveLocation = (index) => {
    if (locations.length <= 1) {
      showCustomAlert('Minimum Locations', 'You must have at least one location');
      return;
    }

    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const handleEditLocation = (index) => {
    setEditingLocationIndex(index);
    setShowLocationPicker(true);
  };

  const handleAddLocation = () => {
    if (locations.length >= 3) {
      showCustomAlert('Maximum Locations', 'You can only have up to 3 locations');
      return;
    }
    setEditingLocationIndex(null);
    setShowLocationPicker(true);
  };

  const handleSaveLocations = async () => {
    if (locations.length === 0) {
      showCustomAlert('No Locations', 'You must have at least one location');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateUserLocations(locations);

      // Update Redux store with new locations
      dispatch(updateUserDetails({
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        locations: response.locations
      }));

      showCustomAlert(
        'Success',
        'Locations updated successfully!',
        () => navigation.navigate('Profile')
      );
    } catch (error) {
      showCustomAlert('Error', error.response?.data?.message || 'Failed to update locations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.title}>Update Locations</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Manage your locations for disaster notifications. You must have at least 1 location and can have up to 3.
        </Text>

        <ScrollView style={styles.locationsContainer} showsVerticalScrollIndicator={false}>
          {locations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Icon name="location" size={20} color={Colors.orange} />
                <Text style={styles.locationName}>{location.name}</Text>
              </View>

              <View style={styles.locationInfo}>
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
                  <Icon name="pencil" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.removeButton,
                    locations.length <= 1 && styles.disabledButton
                  ]}
                  onPress={() => handleRemoveLocation(index)}
                  disabled={locations.length <= 1}
                >
                  <Icon name="trash" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Location Button */}
          {locations.length < 3 && (
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={handleAddLocation}
            >
              <Icon name="add-circle-outline" size={24} color={Colors.orange} />
              <Text style={styles.addLocationText}>Add New Location</Text>
            </TouchableOpacity>
          )}

          {/* Empty State */}
          {locations.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="location-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                No locations added yet. Tap the button above to add your first location.
              </Text>
            </View>
          )}

          {/* Location Counter */}
          <View style={styles.locationCounter}>
            <Text style={styles.counterText}>
              {locations.length}/3 locations used
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSubmitting || locations.length === 0) && styles.saveButtonDisabled
            ]}
            onPress={handleSaveLocations}
            disabled={isSubmitting || locations.length === 0}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Text>
            {!isSubmitting && (
              <Icon name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => {
          setShowLocationPicker(false);
          setEditingLocationIndex(null);
        }}
        onLocationSelected={handleLocationSelected}
        editingLocation={editingLocationIndex !== null ? locations[editingLocationIndex] : null}
      />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkestBlueGray,
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
    backgroundColor: Colors.blueGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  locationsContainer: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textColor,
    marginLeft: 8,
    flex: 1,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  locationCoords: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#6B7280',
  },
  removeButton: {
    backgroundColor: '#FF5722',
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  addLocationButton: {
    backgroundColor: Colors.blueGray,
    borderWidth: 2,
    borderColor: Colors.orange,
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  addLocationText: {
    color: Colors.orange,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
    paddingHorizontal: 40,
  },
  locationCounter: {
    alignItems: 'center',
    marginVertical: 16,
  },
  counterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 20,
  },
  saveButton: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
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
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 300,
    // borderWidth: 1,
    // borderColor: Colors.orange,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textColor,
    textAlign: 'center',
    marginBottom: 16,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButton: {
    backgroundColor: Colors.orange,
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