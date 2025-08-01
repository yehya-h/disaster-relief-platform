import React, { useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, clearSignupData } from '../redux/signupLocationsSlice';
import { getCurrentLocation } from '../services/location/locationService';

export default function SignUpScreen({ navigation, ...others }) {
  const deviceId = useSelector((state) => state.user.deviceId);
  const { locations } = useSelector((state) => state.signupLocations);
  const dispatch = useDispatch();

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
    email: yup.string().required("Email is required").email("Invalid email").matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
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
          password: values.password , 
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
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={styles.input}
            placeholder="First name"
            autoCapitalize="none"
            value={values.fname}
            onChangeText={handleChange('fname')}
            onBlur={handleBlur('fname')}
          />
          {touched.fname && errors.fname && <Text style={styles.error}>{errors.fname}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            autoCapitalize="none"
            value={values.lname}
            onChangeText={handleChange('lname')}
            onBlur={handleBlur('lname')}
          />
          {touched.lname && errors.lname && <Text style={styles.error}>{errors.lname}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
          />
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
          />
          {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={values.cPassword}
            onChangeText={handleChange('cPassword')}
            onBlur={handleBlur('cPassword')}
          />
          {touched.cPassword && errors.cPassword && <Text style={styles.error}>{errors.cPassword}</Text>}

          <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
            <Text style={styles.continueButtonText}>Press here to continue →</Text>
          </TouchableOpacity>
          
          <Text style={styles.loginLink} onPress={() => navigation.goBack()}>
            Already have an account? Login
          </Text>
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: { color: '#007bff', marginTop: 20, textAlign: 'center' },
  savedLocationsIndicator: {
    backgroundColor: '#e0f2f7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  savedLocationsText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
});
