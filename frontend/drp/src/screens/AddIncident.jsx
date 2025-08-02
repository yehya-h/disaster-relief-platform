import React from 'react';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { submitIncidentApi } from '../api/incidentApi';
import { fetchIncidentTypes } from '../redux/incidentTypesSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getCurrentLocation } from '../services/location/locationService';

// const incidentTypes = ['Fire', 'Flood', 'Crime'];
const severityLevels = ['Low', 'Medium', 'High'];

export default function AddIncident() {
  const types = useSelector(state => state.incidentTypes.incidentTypes);

  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false); //spinner appearing
  const [imagePreview, setImagePreview] = useState(null); // preview uploaded image
  const [imageData, setImageData] = useState(null); // image info to be sent to the backend

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchIncidentTypes());
      } catch (error) {
        Alert.alert('Failed to load incident types');
      }
    };

    fetchData();
  }, [dispatch]);

  // const liveLocation = useSelector(state => state.liveLoc.liveLoc);
  // useEffect(() => {
  //   console.log('Live coordinates:', liveLocation);
  // }, [liveLocation]);

  const requestCameraPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickImage = async setFieldValue => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert('Camera permission denied');
      return;
    }
    launchCamera({ mediaType: 'photo' }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      setImagePreview(asset.uri);
      setImageData({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName,
      });
      setFieldValue('image', asset);
    });
  };

  const IncidentSchema = Yup.object().shape({
    type: Yup.string().required('Please select incident type'),
    severity: Yup.string().required('Please select a severity level'),
    image: Yup.mixed().required('Please add an image for the incident'),
  });

  const submitIncident = async (values, { resetForm }) => {
    try {
      setUploading(true);

      const liveLocation = await getCurrentLocation();

      if (!liveLocation) {
        Alert.alert('Location Error', 'Unable to fetch your current location.');
        setUploading(false);
        return;
      } else {
        console.log('live location:', liveLocation);
      }

      const incidentData = {
        type: values.type, // Id from Picker
        severity: values.severity,
        description: values.description || '',
        // userId: '687feef629508b6ef7143985',
        timestamp: Date.now,
        location: {
          coordinates: [liveLocation.longitude, liveLocation.latitude],
          // coordinates: [35, 45],
        },
      };

      const result = await submitIncidentApi(incidentData, imageData);

      console.log('Server response:', result);
      if (result?.status === 200) {
        Alert.alert(result.data?.message);
      } else if (result?.status === 201) {
        Alert.alert(
          'Thank you',
          'Your report is submitted succefully.',
          result,
        );
        //   Alert.alert(
        //     'Are you sure?',
        //     'Do you want to log out?',
        //     [
        //       {
        //         text: 'No',
        //         onPress: () => console.log('User canceled'),
        //         style: 'cancel',
        //       },
        //       {
        //         text: 'Yes',
        //         onPress: () => {
        //           console.log('User confirmed');
        //           // Add your logic here, like logout()
        //         },
        //       },
        //     ],
        //     { cancelable: false },
        //   );
      }
      resetForm();
      setImagePreview(null);
      setImageData(null);
    } catch (err) {
      if (err.response?.status === 422) {
        Alert.alert('Invalid Incident', err.response.data.message);
      } else {
        Alert.alert('Submission Failed', 'Please try again later.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Formik
      initialValues={{ type: '', severity: '', description: '', image: null }}
      validationSchema={IncidentSchema}
      onSubmit={submitIncident}
    >
      {({
        handleChange,
        handleSubmit,
        values,
        errors,
        setFieldValue,
        touched,
      }) => (
        <View style={styles.container}>
          <Button title="Take Photo" onPress={() => pickImage(setFieldValue)} />
          {imagePreview && (
            <Image source={{ uri: imagePreview }} style={styles.preview} />
          )}
          {touched.image && errors.image && (
            <Text style={styles.error}>{errors.image}</Text>
          )}

          <Text style={styles.label}>Incident Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={values.type}
              onValueChange={itemValue => setFieldValue('type', itemValue)}
            >
              <Picker.Item label="Select Type" value="" />
              {types.map(type => (
                <Picker.Item
                  label={type.name}
                  value={type._id}
                  key={type._id}
                />
              ))}
            </Picker>
          </View>
          {touched.type && errors.type && (
            <Text style={styles.error}>{errors.type}</Text>
          )}

          <Text style={styles.label}>Severity</Text>
          {severityLevels.map(level => (
            <TouchableOpacity
              key={level}
              onPress={() => setFieldValue('severity', level)}
              style={styles.radioContainer}
            >
              <View style={styles.radioCircle}>
                {values.severity === level && (
                  <View style={styles.selectedDot} />
                )}
              </View>
              <Text style={styles.radioLabel}>{level}</Text>
            </TouchableOpacity>
          ))}
          {touched.severity && errors.severity && (
            <Text style={styles.error}>{errors.severity}</Text>
          )}

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            placeholder="e.g., Smoke seen coming from building..."
            multiline
            value={values.description}
            onChangeText={handleChange('description')}
            style={styles.textArea}
          />

          {uploading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Submit Report" onPress={handleSubmit} />
          )}
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  error: { color: 'red', marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#555',
  },
  radioLabel: {
    fontSize: 16,
  },
  preview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    alignSelf: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    height: 100,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
});
