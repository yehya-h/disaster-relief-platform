import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { updateUserPassword } from '../api/UserApi';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const updatePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function UpdatePassword({ navigation }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null });

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

  const handleUpdatePassword = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      await updateUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      showCustomAlert(
        'Success',
        'Password updated successfully!',
        () => {
          resetForm();
          navigation.navigate('Profile')
        }
      );
    } catch (error) {
      showCustomAlert('Error', error.response?.data?.message || 'Failed to update password');
      console.log(error);
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
        <Text style={styles.title}>Update Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Enter your current password and choose a new secure password
        </Text>

        <Formik
          validationSchema={updatePasswordSchema}
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }}
          onSubmit={handleUpdatePassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showCurrentPassword}
                  value={values.currentPassword}
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  maxLength={20}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
              </View>
              {touched.currentPassword && errors.currentPassword && (
                <Text style={styles.error}>{errors.currentPassword}</Text>
              )}

              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showNewPassword}
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  maxLength={20}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
              </View>
              {touched.newPassword && errors.newPassword && (
                <Text style={styles.error}>{errors.newPassword}</Text>
              )}

              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  maxLength={20}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity
                style={[styles.updateButton, isSubmitting && styles.updateButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.updateButtonText}>
                  {isSubmitting ? 'Updating Password...' : 'Update Password'}
                </Text>
                {!isSubmitting && (
                  <Icon name="shield-checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>

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
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textColor,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
    marginBottom: 10,
    marginTop: -8,
    marginLeft: 4,
  },
  securityTips: {
    backgroundColor: Colors.blueGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textColor,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  updateButton: {
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
    borderWidth: 1,
    borderColor: Colors.orange,
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