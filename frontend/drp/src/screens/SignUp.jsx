import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ScrollView, Modal } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, clearSignupData } from '../redux/signupLocationsSlice';
import { getCurrentLocation } from '../services/location/locationService';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SignUpScreen({ navigation, ...others }) {
  const deviceId = useSelector((state) => state.user.deviceId);
  const { locations } = useSelector((state) => state.signupLocations);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showCustomAlert = (title, message) => {
    setAlertConfig({ title, message });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  // Clear any existing signup data when component mounts
  useEffect(() => {
    dispatch(clearSignupData());
  }, [dispatch]);

  // // Clear form when navigating back from location selection
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset form when screen comes into focus
      if (navigation.getState().routes.find(route => route.name === 'SignUp')) {
        // Form will be reset by Formik's initialValues
      }
    });

    return unsubscribe;
  }, [navigation]);

  let userSchema = yup.object({
    fname: yup.string().required("First name is required"),
    lname: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required").email("Invalid email").matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i, "Invalid email"),
    password: yup.string().min(6, "Password can't be less than 6").required("Password is required"),
    cPassword: yup.string().oneOf([yup.ref('password')], "Passwords does not match").required("Confirm Password is required"),
  });

  const onContinue = async (values) => {
    try {
      const loc = await getCurrentLocation();
      const userPayload = {
        fname: values.fname,
        lname: values.lname,
        email: values.email,
        password: values.password,
        role: 0,
        liveLocation: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude]
        },
        deviceId: deviceId
      };

      // Save user data to Redux state
      dispatch(setUserData(userPayload));

      // Navigate to location selection screen
      navigation.navigate('LocationSelection', {
        setIsLoggedIn: others.setIsLoggedIn
      });

    } catch (e) {
      console.log("Location error:", e);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
  };

  return (
    <Formik
      validationSchema={userSchema}
      initialValues={{ fname: '', lname: '', email: '', password: '', cPassword: '' }}
      onSubmit={(values) => {
        console.log(values);
        onContinue(values);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.formContainer}>

          <Text style={styles.title}>Create Account</Text>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
                value={values.fname}
                onChangeText={handleChange('fname')}
                onBlur={handleBlur('fname')}
                maxLength={20}
              />
            </View>
            {touched.fname && errors.fname && <Text style={styles.error}>{errors.fname}</Text>}

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
                maxLength={128}
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
                maxLength={20}
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

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                value={values.cPassword}
                onChangeText={handleChange('cPassword')}
                onBlur={handleBlur('cPassword')}
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
            {touched.cPassword && errors.cPassword && <Text style={styles.error}>{errors.cPassword}</Text>}

            <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? Login</Text>
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
          </ScrollView>
        </View>
      )}
    </Formik>
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginBottom: 40,
    lineHeight: 40,
    textAlign: 'center'
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
  continueButton: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: Colors.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    paddingTop: 10
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  savedLocationsIndicator: {
    backgroundColor: Colors.blueGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.orange,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  savedLocationsText: {
    color: Colors.orange,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
