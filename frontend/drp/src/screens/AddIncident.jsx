import React from 'react';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  submitForAnalysis,
  submitIncidentWithApproval,
} from '../api/incidentApi';
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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getCurrentLocation } from '../services/location/locationService';
import AnalysisModal from '../components/AnalysisModal'; // Import the independent component
import { ScrollView } from 'react-native-gesture-handler';
import ImageResizer from 'react-native-image-resizer';

const severityLevels = ['Low', 'Medium', 'High'];

export default function AddIncident() {
  const types = useSelector(state => state.incidentTypes.incidentTypes);
  const dispatch = useDispatch();

  // Original states
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);

  // New states for two-step process
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [currentFormData, setCurrentFormData] = useState(null);

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

  const requestCameraPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const compressImage = async uri => {
    try {
      const result = await ImageResizer.createResizedImage(
        uri,
        1024, // max width
        1024, // max height
        'JPEG',
        90, // quality (like your Python example)
        0, // rotation
      );
      return result.uri; // use this in your upload
    } catch (err) {
      console.error('Compression error:', err);
      throw err;
    }
  };

  const pickImageFromCamera = async setFieldValue => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert('Camera permission denied');
      return;
    }
    launchCamera({ mediaType: 'photo' }, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const compressedUri = await compressImage(asset.uri);

      setImagePreview(compressedUri);
      setImageData({
        uri: compressedUri,
        type: asset.type,
        name: asset.fileName,
      });
      setFieldValue('image', {
        uri: compressedUri,
        type: asset.type,
        name: asset.fileName,
      });
    });
  };

  const pickImageFromGallery = async setFieldValue => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        const compressedUri = await compressImage(asset.uri);

        setImagePreview(compressedUri);
        setImageData({
          uri: compressedUri,
          type: asset.type,
          name: asset.fileName || 'demo-image.jpg',
        });
        setFieldValue('image', {
          uri: compressedUri,
          type: asset.type,
          name: asset.fileName || 'demo-image.jpg',
        });
      },
    );
  };

  const showImagePickerOptions = setFieldValue => {
    Alert.alert('Select Image', 'Choose how you want to add an image', [
      {
        text: 'Camera',
        onPress: () => pickImageFromCamera(setFieldValue),
      },
      {
        text: 'Upload from Gallery',
        onPress: () => pickImageFromGallery(setFieldValue),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const IncidentSchema = Yup.object().shape({
    type: Yup.string().required('Please select incident type'),
    severity: Yup.string().required('Please select a severity level'),
    image: Yup.mixed().required('Please add an image for the incident'),
  });

  // Step 1: Submit for analysis
  const submitForAnalysisStep = async (values, { resetForm }) => {
    try {
      setUploading(true);

      const liveLocation = await getCurrentLocation();
      if (!liveLocation) {
        Alert.alert('Location Error', 'Unable to fetch your current location.');
        setUploading(false);
        return;
      }

      const incidentData = {
        type: values.type,
        severity: values.severity,
        description: values.description || '',
        timestamp: Date.now(),
        location: {
          coordinates: [liveLocation.longitude, liveLocation.latitude],
        },
        image: imageData,
      };

      // Store current form data for later use
      setCurrentFormData(incidentData);

      const result = await submitForAnalysis(incidentData);
      console.log('Analysis result:', result);

      if (result.analysis) {
        if (result.analysis.is_incident) {
          // Show analysis for approval
          setAnalysisResult(result.analysis);
          setShowAnalysisModal(true);
        } else {
          // Handle case where AI determined it's not a real incident
          Alert.alert(
            'Analysis Complete',
            result.message ||
              'This report does not appear to be a real incident.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  // User can edit and resubmit
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  resetForm();
                  setImagePreview(null);
                  setImageData(null);
                },
              },
            ],
          );
        }
      }
    } catch (err) {
      if (err.response?.status === 422) {
        Alert.alert('Invalid Incident', err.response.data.message);
      } else {
        console.error('Analysis error:', err);
        Alert.alert('Analysis Failed', 'Please try again later.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Step 2: Handle user approval
  const handleApproval = async resetForm => {
    try {
      setSubmittingFinal(true);
      setShowAnalysisModal(false);

      const result = await submitIncidentWithApproval(
        currentFormData,
        analysisResult,
        true,
      );

      console.log('Final submission result:', result);

      // Reset all states
      setAnalysisResult(null);
      setCurrentFormData(null);
      setImagePreview(null);
      setImageData(null);
      if (resetForm) resetForm();

      if (result) {
        Alert.alert(
          'Success',
          result.message ||
            'Your incident report has been submitted successfully!',
        );
      }
    } catch (error) {
      console.error('Final submission error:', error);
      Alert.alert(
        'Submission Failed',
        error.response?.data?.message || 'Please try again later.',
      );
    } finally {
      setSubmittingFinal(false);
    }
  };

  // Step 2: Handle user rejection
  const handleRejection = resetForm => {
    setShowAnalysisModal(false);
    setAnalysisResult(null);
    setCurrentFormData(null);
    setImagePreview(null);
    setImageData(null);
    if (resetForm) resetForm();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAnalysisModal(false);
  };

  return (
    <ScrollView>
      <Formik
        initialValues={{ type: '', severity: '', description: '', image: null }}
        validationSchema={IncidentSchema}
        onSubmit={submitForAnalysisStep}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          setFieldValue,
          touched,
          resetForm,
        }) => (
          <View style={styles.container}>
            <View style={styles.imageButtonContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => pickImageFromCamera(setFieldValue)}
              >
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageButton, styles.uploadButton]}
                onPress={() => pickImageFromGallery(setFieldValue)}
              >
                <Text style={styles.imageButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            {/* Alternative: Single button with options */}
            {/* <Button
            title="Add Image"
            onPress={() => showImagePickerOptions(setFieldValue)}
          /> */}
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
              <Button title="Analyze Report" onPress={handleSubmit} />
            )}

            {/* Use the independent AnalysisModal component */}
            <AnalysisModal
              visible={showAnalysisModal}
              analysisResult={analysisResult}
              submittingFinal={submittingFinal}
              onApprove={() => handleApproval(resetForm)}
              onReject={() => handleRejection(resetForm)}
              onRequestClose={handleModalClose}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

// Styles remain the same, but remove modal-related styles
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
  // Image button styles
  imageButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});