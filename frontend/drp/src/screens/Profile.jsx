import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as yup from 'yup';
import { updateUserInfo } from '../api/UserApi';
import { updateUserDetails } from '../redux/UserSlice';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const updateProfileSchema = yup.object({
  fname: yup.string().required('First name is required').trim(),
  lname: yup.string().required('Last name is required').trim(),
});

export default function Profile({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showCustomAlert = (title, message) => {
    setAlertConfig({ title, message });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const goToUpdatePassword = () => {
    navigation.navigate('UpdatePassword');
  };

  const goToUpdateLocations = () => {
    navigation.navigate('UpdateLocations');
  };

  const handleUpdateProfile = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await updateUserInfo({
        fname: values.fname,
        lname: values.lname
      });

      dispatch(updateUserDetails({
        fname: values.fname,
        lname: values.lname,
        email: user.email,
        locations: user.locations
      }));

      showCustomAlert('Success', 'Profile updated successfully!');
    } catch (error) {
      showCustomAlert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Update Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Formik
          validationSchema={updateProfileSchema}
          initialValues={{
            fname: user.fname || '',
            lname: user.lname || ''
          }}
          onSubmit={handleUpdateProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <View style={styles.section}>

                {/* First Name Input */}
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                    value={values.fname}
                    onChangeText={handleChange('fname')}
                    onBlur={handleBlur('fname')}
                    maxLength={20}
                  />
                </View>
                {touched.fname && errors.fname && <Text style={styles.error}>{errors.fname}</Text>}

                {/* Last Name Input */}
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                    value={values.lname}
                    onChangeText={handleChange('lname')}
                    onBlur={handleBlur('lname')}
                    maxLength={20}
                  />
                </View>
                {touched.lname && errors.lname && <Text style={styles.error}>{errors.lname}</Text>}

                {/* Email Display (Read-only) */}
                <View style={[styles.inputContainer, styles.disabledInput]}>
                  <Icon name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <Text style={styles.disabledInputText}>{user.email}</Text>
                </View>
                <Text style={styles.helperText}>Email cannot be changed</Text>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.updateButton, isSubmitting && styles.updateButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.updateButtonText}>
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </Text>
                  {!isSubmitting && (
                    <Icon name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <TouchableOpacity style={styles.actionCard} onPress={goToUpdatePassword}>
                  <View style={styles.actionCardLeft}>
                    <Icon name="lock-closed-outline" size={24} color={Colors.orange} />
                    <View style={styles.actionCardText}>
                      <Text style={styles.actionCardTitle}>Update Password</Text>
                      <Text style={styles.actionCardSubtitle}>Change your account password</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Locations Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Locations ({user.locations?.length || 0}/3)</Text>

                {/* Locations Preview */}
                <View style={styles.locationsPreview}>
                  {user.locations && user.locations.length > 0 ? (
                    user.locations.map((location, index) => (
                      <View key={index} style={styles.locationPreviewCard}>
                        <Icon name="location" size={16} color={Colors.orange} />
                        <View style={styles.locationPreviewInfo}>
                          <Text style={styles.locationPreviewName}>{location.location?.name || 'Unnamed Location'}</Text>
                          <Text style={styles.locationPreviewAddress} numberOfLines={1}>
                            {location.location.coordinates && location.location.coordinates[1] && location.location.coordinates[0]
                              ? `${location.location.coordinates[1].toFixed(6)}, ${location.location.coordinates[0].toFixed(6)}`
                              : 'Coordinates not available'
                            }
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyLocations}>
                      <Icon name="location-outline" size={32} color={Colors.textSecondary} />
                      <Text style={styles.emptyLocationsText}>No locations added</Text>
                    </View>
                  )}
                </View>

                {/* Update Locations Button */}
                <TouchableOpacity style={styles.actionCard} onPress={goToUpdateLocations}>
                  <View style={styles.actionCardLeft}>
                    <Icon name="map-outline" size={24} color={Colors.orange} />
                    <View style={styles.actionCardText}>
                      <Text style={styles.actionCardTitle}>Manage Locations</Text>
                      <Text style={styles.actionCardSubtitle}>Add, edit, or remove your locations</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </ScrollView>

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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textColor,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  disabledInput: {
    opacity: 0.6,
    borderColor: Colors.textSecondary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textColor,
    fontSize: 16,
  },
  disabledInputText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
    marginBottom: 10,
    marginTop: -8,
    marginLeft: 4,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  actionCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.orange,
    marginBottom: 12,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardText: {
    marginLeft: 12,
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textColor,
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  locationsPreview: {
    marginBottom: 16,
  },
  locationPreviewCard: {
    backgroundColor: Colors.blueGray,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  locationPreviewInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textColor,
    marginBottom: 2,
  },
  locationPreviewAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyLocations: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyLocationsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
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