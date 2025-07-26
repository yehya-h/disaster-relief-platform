import React from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { registerUser } from '../api/AuthApi';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../redux/UserSlice';
import { getCurrentLocation } from '../services/location/locationService';
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

export default function SignUpScreen({ navigation, ...others }) {
  // const liveLoc = useSelector((state) => state.liveLoc.liveLoc);
  const deviceId = useSelector((state) => state.user.deviceId);
  console.log("deviceId: ", deviceId);
  const dispatch = useDispatch();

  let userSchema = yup.object({
    fname: yup.string().required("First name is required"),
    lname: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup.string().min(6, "Password can't be less than 6").required("Password is required"),
    cPassword: yup.string().oneOf([yup.ref('password')], "Passwords does not match").required("Confirm Password is required"),
  });

  const onSignUp = async (values) => {
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
      const res = await registerUser(userPayload);
      console.log("Signup response:", res);
      if (res && res.token) {
        await AsyncStorage.setItem('token', res.token);
        const decoded = jwtDecode(res.token);
        console.log("user ", decoded, " ", res.token);
        dispatch(addUser({userId: decoded.id, role: decoded.role}));
        others.setIsLoggedIn(true);
      } else {
        Alert.alert('Signup failed', 'Invalid response from server');
      }

    } catch (e) {
      console.log("Signup error:", e);
      Alert.alert('Signup failed', e.response?.data?.message || e.message);
    }

  };

  return (
    <Formik
      validationSchema={userSchema}
      initialValues={{ fname: '', lname: '', email: '', password: '', cPassword: '' }}
      onSubmit={(values) => {
        console.log(values);
        onSignUp(values);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        // handleBlur('email'): marks field as touched.
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

          <Button title="Sign Up" onPress={handleSubmit} />
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
  loginLink: { color: '#007bff', marginTop: 20, textAlign: 'center' },
});
