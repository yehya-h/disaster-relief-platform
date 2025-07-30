import { TouchableOpacity, View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from '../api/AuthApi';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, updateUserDetails } from '../redux/UserSlice';
import jwtDecode from "jwt-decode";
import { getCurrentLocation } from '../services/location/locationService';
import { getUserById } from '../api/UserApi';
import React, { useState } from 'react';
import { showSuccessToast } from '../utils/toast';

export default function SignIn({ navigation, ...others }) {
  const dispatch = useDispatch();
  const deviceId = useSelector((state) => state.user.deviceId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let userSchema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup.string().min(6, "Password can't be less than 6").required("Password is required"),
  });

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const onLogin = async (values) => {
    setIsSubmitting(true);
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

      const res = await loginUser(userPayload);
      console.log("Login response:", res);

      if (res && res.token) {
        await AsyncStorage.setItem('token', res.token);
        const decoded = jwtDecode(res.token);
        console.log("user ", decoded, " ", res.token);

        const userDetails = await getUserById();
        dispatch(updateUserDetails({
          fname: userDetails.fname,
          lname: userDetails.lname,
          email: userDetails.email
        }));

        dispatch(addUser({ userId: decoded.id, role: decoded.role }));
        others.setIsLoggedIn(true);
        showSuccessToast('Login successful!');
      } else {
        Alert.alert('Login failed', 'Invalid response from server');
      }
      setIsSubmitting(false);
    } catch (e) {
      console.log("Login error:", e);
      Alert.alert('Login failed', e.response?.data?.message || e.message);
      setIsSubmitting(false);
    }

  };

  return (
    <Formik
      validationSchema={userSchema}
      initialValues={{ email: '', password: '' }}
      onSubmit={(values) => {
        console.log(values);
        onLogin(values);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
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
          
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToSignUp} style={styles.signupLink}>
            <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
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
  signupLink: { marginTop: 20, alignItems: 'center' },
  signupText: { color: '#007bff', marginTop: 10 },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});