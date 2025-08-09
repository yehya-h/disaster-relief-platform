import { TouchableOpacity, View, TextInput, Button, StyleSheet, Text, Alert, Modal } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, resendVerification } from '../api/AuthApi';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, updateUserDetails } from '../redux/UserSlice';
import jwtDecode from "jwt-decode";
import { getCurrentLocation } from '../services/location/locationService';
import { getUserById } from '../api/UserApi';
import React, { useState } from 'react';
// import { showSuccessToast } from '../utils/toast';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { UserDataHelper } from '../services/UserDataHelper';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SignIn({ navigation, route, ...others }) {
  const dispatch = useDispatch();
  const deviceId = useSelector((state) => state.user.deviceId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [maxResends, setMaxResends] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  // Get pre-filled credentials from route params
  const prefillEmail = route?.params?.prefillEmail || '';
  const prefillPassword = route?.params?.prefillPassword || '';

  let userSchema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email").matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i, "Invalid email"),
    password: yup.string().min(6, "Password can't be less than 6").required("Password is required"),
  });

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const showCustomAlert = (title, message) => {
    setAlertConfig({ title, message });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const handleResendVerification = async (currentPassword) => {
    if (!resendEmail) {
      // Alert.alert('Error', 'Email address not found');
      showCustomAlert('Login failed', 'Email address not found');
      return;
    }

    if (!currentPassword) {
      // Alert.alert('Password Required', 'Please enter your password in the password field above and try again.');
      showCustomAlert('Login failed', 'Please enter your password in the password field above and try again.');
      return;
    }

    setIsResending(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, resendEmail, currentPassword);
      const user = userCredential.user;

      // Password is correct, now check with backend for tracking and limits
      const backendResponse = await resendVerification(resendEmail);

      // If backend allows, send email verification via Firebase
      await sendEmailVerification(user);

      // Update local state with backend response
      setResendCount(backendResponse.resendCount);
      setMaxResends(backendResponse.maxResends);

      // Alert.alert(
      //   'Verification Email Sent',
      //   `A new verification email has been sent to your email address. Please check your inbox and click the verification link.\n\nAttempts used: ${backendResponse.resendCount}/${backendResponse.maxResends}`,
      //   [{ text: 'OK' }]
      // );
      showCustomAlert('Verification Email Sent', 
        `A new verification email has been sent to your email address. Please check your inbox and click the verification link.\n\nAttempts used: ${backendResponse.resendCount}/${backendResponse.maxResends}`,
      );
      // Sign out from Firebase
      await auth.signOut();

    } catch (error) {
      console.error('Firebase error:', error);

      let errorMessage = 'Failed to send verification email.';

      if (error.response?.status === 429) {
        const data = error.response.data;
        errorMessage = data.message;
        setResendCount(data.resendCount);
        setMaxResends(data.maxResends);
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400 && error.response.data.message.includes('Email is already verified')) {
        errorMessage = error.response.data.message;
        setShowResendLink(false);
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please check your password and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait a while before trying again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      }

      // Alert.alert('Error', errorMessage);        
      showCustomAlert('Error', errorMessage);

      return;
    } finally {
      setIsResending(false);
    }
  };

  const onLogin = async (values) => {
    setIsSubmitting(true);
    setShowResendLink(false); // Reset resend link visibility
    setResendCount(0); // Reset resend count
    const loc = await getCurrentLocation();
    try {
      const userPayload = {
        email: values.email,
        password: values.password,
        liveLocation: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude]
        },
        deviceId: deviceId
      };
      console.log("userPayload: ", userPayload);

      const res = await loginUser(userPayload);
      console.log("Login response:", res);

      if (res && res.token) {
        // await AsyncStorage.setItem('token', res.token);
        await UserDataHelper.setAuthToken(res.token);
        const decoded = jwtDecode(res.token);
        console.log("user ", decoded, " ", res.token);

        const userDetails = await getUserById();
        dispatch(updateUserDetails({
          fname: userDetails.fname,
          lname: userDetails.lname,
          email: userDetails.email,
          locations: userDetails.locations || [],
        }));

        dispatch(addUser({ userId: decoded.id, role: decoded.role }));
        others.setIsLoggedIn(true);
        // showSuccessToast('Login successful!');
      } else {
        // Alert.alert('Login failed', 'Invalid response from server');
        showCustomAlert('Login failed', 'Invalid response from server');
      }
      setIsSubmitting(false);
    } catch (e) {
      console.log("Login error:", e);
      const errorMessage = e.response?.data?.message || e.message;

      if (errorMessage.includes('Email address not found')) {
        showCustomAlert('Account Not Found', 'No account exists with this email. Please sign up first.');
        setIsSubmitting(false);
        return;
      }

      if (errorMessage.includes('Incorrect password')) {
        // Alert.alert('Login failed', 'Incorrect password. Please check your password and try again.');
        showCustomAlert('Login failed', 'Incorrect password. Please check your password and try again.');
        setIsSubmitting(false);
        return;
      }

      const resendCountFromServer = e.response?.data?.resendCount || 0;
      const maxResendsFromServer = e.response?.data?.maxResends || 3;

      // Special handling for email verification error
      if (errorMessage.includes('Email not verified') || errorMessage.includes('Email not verified!')) {
        setShowResendLink(true);
        setResendEmail(values.email);
        setResendCount(resendCountFromServer);
        setMaxResends(maxResendsFromServer);

        const remainingAttempts = maxResendsFromServer - resendCountFromServer;
        const attemptsMessage = remainingAttempts > 0
          ? `\n\nYou have ${remainingAttempts} verification email attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
          : '\n\nYou have reached the maximum number of verification emails.';

        showCustomAlert('Email Not Verified',`Please check your email and click the verification link before logging in.${attemptsMessage}`);
      } else {
        // Alert.alert('Login failed', errorMessage);
        showCustomAlert('Login failed', errorMessage)
      }
      setIsSubmitting(false);
    }

  };

  return (
    <Formik
      validationSchema={userSchema}
      initialValues={{ email: prefillEmail, password: prefillPassword }}
      onSubmit={(values) => {
        console.log(values);
        onLogin(values);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>

          {prefillEmail && prefillPassword && (
            <Text style={styles.infoText}>
              Your credentials have been pre-filled. Please verify your email before logging in.
            </Text>
          )}

          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
            />
          </View>
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry={!showPassword}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={Colors.orange}
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {showResendLink && (
            <TouchableOpacity
              style={[
                styles.resendButton,
                (isResending || resendCount >= maxResends) && styles.resendButtonDisabled
              ]}
              onPress={() => handleResendVerification(values.password)}
              disabled={isResending || resendCount >= maxResends}
            >
              <Text style={styles.resendButtonText}>
                {isResending
                  ? 'Sending...'
                  : resendCount >= maxResends
                    ? 'Maximum Attempts Reached'
                    : `Resend Verification Link (${maxResends - resendCount} left)`
                }
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={goToSignUp} style={styles.signupLink}>
            <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>

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
      )}
    </Formik>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkestBlueGray,
    padding: 20
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginBottom: 40,
    lineHeight: 40,
    textAlign: 'center',
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
  submitButton: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    color: Colors.orange,
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  resendButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  signupText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoText: {
    color: Colors.orange,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
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
    fontSize: 20,
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
