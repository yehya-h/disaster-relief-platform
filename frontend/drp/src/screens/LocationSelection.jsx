import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import LocationPicker from '../components/LocationPicker';
import { registerUser } from '../api/AuthApi';
import { useDispatch, useSelector } from 'react-redux';
import { addLocation, removeLocation, updateLocation, clearSignupData } from '../redux/signupLocationsSlice';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
// import colors from '../constants/colors';
import { useTheme } from '../hooks/useThem';
import Icon from 'react-native-vector-icons/Ionicons';

const LocationSelection = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme(); 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkestBlueGray,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textColor,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationsContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  locationCard: {
    backgroundColor: colors.blueGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textColor,
    marginLeft: 8,
    flex: 1,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  locationCoords: {
    fontSize: 12,
    color: colors.textSecondary,
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
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  addLocationButton: {
    backgroundColor: colors.blueGray,
    borderWidth: 2,
    borderColor: colors.orange,
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
  },
  addLocationText: {
    color: colors.orange,
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
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
    paddingHorizontal: 40,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.blueGray,
    backgroundColor: colors.darkestBlueGray,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
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
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });
  const dispatch = useDispatch();

  // Get locations and user data from Redux state
  const { locations, userData } = useSelector((state) => state.signupLocations);

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

  const handleLocationSelected = (locationData) => {
    if (editingLocationIndex !== null) {
      // Editing existing location
      dispatch(updateLocation({ index: editingLocationIndex, location: locationData }));
      setEditingLocationIndex(null);
    } else {
      // Adding new location
      if (locations.length >= 3) {
        showCustomAlert('Maximum Locations', 'You can only add up to 3 locations');
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
      // Alert.alert('No Locations', 'Please add at least one location to continue');
      showCustomAlert('No Locations', 'Please add at least one location to continue');
      return;
    }

    if (!userData) {
      // Alert.alert('Error', 'User data not found. Please go back and try again.');
      showCustomAlert('Error', 'User data not found. Please go back and try again.');
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

      if (!res || !res.message) {
        // Alert.alert('Signup failed', 'Invalid response from server');
        showCustomAlert('Signup failed', 'Invalid response from server');
        return;
      }

      if (res.status == 201) {

        try {
          // Sign in user immediately after backend registration
          const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
          const user = userCredential.user;

          // Send email verification
          await sendEmailVerification(user);

          showCustomAlert(
            'Registration Successful!',
            'Your account has been created successfully! Please check your email for a verification link. Once verified, you can login with your credentials.',
            () => {
              // Navigate to login screen with pre-filled email and password
              navigation.navigate('SignIn', {
                prefillEmail: userData.email,
                prefillPassword: userData.password
              });
            }
          );

          await auth.signOut();

        } catch (firebaseError) {
          console.error('Firebase sign-in or verification error:', firebaseError);
          // Alert.alert('Error', 'Could not send verification email. Please try logging in.');
          showCustomAlert('Error', 'Could not send verification email. Please try logging in.');
        }
      }
      // Clear signup data from Redux
      dispatch(clearSignupData());

    } catch (error) {
      console.log('Error during signup:', error);
      // Alert.alert('Error', error.response?.data?.message || 'Failed to complete signup. Please try again.');
      showCustomAlert('Error', error.response?.data?.message || 'Failed to complete signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.textColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Add Your{'\n'}Locations</Text>
          <Text style={styles.subtitle}>
            Enter at least one location to be notified if a disaster happens nearby
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.locationsContainer}>
          {locations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Icon name="location" size={20} color={colors.orange} />
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
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveLocation(index)}
                >
                  <Icon name="trash" size={16} color="#fff" />
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
              <Icon name="add-circle-outline" size={24} color={colors.orange} />
              <Text style={styles.addLocationText}>Add Location</Text>
            </TouchableOpacity>
          )}

          {locations.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="location-outline" size={64} color={colors.textSecondary} />
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
          {!isSubmitting && (
            <Icon name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
          )}
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
};


export default LocationSelection; 