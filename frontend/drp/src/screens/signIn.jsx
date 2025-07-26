import { TouchableOpacity, View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from '../api/AuthApi';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/UserSlice';
import jwtDecode from "jwt-decode";
import { getCurrentLocation } from '../services/location/locationService';

export default function LoginScreen({ navigation, ...others }) {
  const dispatch = useDispatch();
  const deviceId = useSelector((state) => state.user.deviceId);

  let userSchema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup.string().min(6, "Password can't be less than 6").required("Password is required"),
  });

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const onLogin = async (values) => {
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
        dispatch(addUser({userId: decoded.id, role: decoded.role}));
        others.setIsLoggedIn(true);
      } else {
        Alert.alert('Login failed', 'Invalid response from server');
      }

    } catch (e) {
      console.log("Login error:", e);
      Alert.alert('Login failed', e.response?.data?.message || e.message);
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
          <Button title="Login" onPress={handleSubmit} />
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
});