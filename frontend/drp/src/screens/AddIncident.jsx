import React from 'react';
import { useState, useEffect } from 'react';
// import { Picker } from '@react-native-picker/picker';
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
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getCurrentLocation } from '../services/location/locationService';
import AnalysisModal from '../components/AnalysisModal';
import CustomAlert from '../components/CustomAlert';
import ImageResizer from 'react-native-image-resizer';
import Colors from '../constants/colors';
import CustomPicker from '../components/CustomPicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  // Custom Alert Function
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertData({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setAlertVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchIncidentTypes());
      } catch (error) {
        showCustomAlert('Error', 'Failed to load incident types');
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
        1024,
        1024,
        'JPEG',
        90,
        0,
      );
      return result.uri;
    } catch (err) {
      console.error('Compression error:', err);
      throw err;
    }
  };

  const pickImageFromCamera = async setFieldValue => {
    const granted = await requestCameraPermission();
    if (!granted) {
      showCustomAlert(
        'Permission Denied',
        'Camera permission is required to take photos',
      );
      return;
    }
    launchCamera({ mediaType: 'photo' }, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        showCustomAlert(
          'Error',
          response.errorMessage || 'Failed to capture image',
        );
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
          showCustomAlert(
            'Error',
            response.errorMessage || 'Failed to select image',
          );
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
    showCustomAlert('Select Image', 'Choose how you want to add an image', [
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

  const submitForAnalysisStep = async (values, { resetForm }) => {
    try {
      setUploading(true);

      const liveLocation = await getCurrentLocation();
      if (!liveLocation) {
        showCustomAlert(
          'Location Error',
          'Unable to fetch your current location.',
        );
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

      setCurrentFormData(incidentData);

      const result = await submitForAnalysis(incidentData);
      console.log('Analysis result:', result);

      if (result.analysis) {
        if (result.analysis.is_incident) {
          setAnalysisResult(result.analysis);
          setShowAnalysisModal(true);
        } else {
          showCustomAlert(
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
                style: 'cancel',
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
        showCustomAlert('Invalid Incident', err.response.data.message);
      } else {
        console.error('Analysis error:', err);
        showCustomAlert('Analysis Failed', 'Please try again later.');
      }
    } finally {
      setUploading(false);
    }
  };

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

      setAnalysisResult(null);
      setCurrentFormData(null);
      setImagePreview(null);
      setImageData(null);
      if (resetForm) resetForm();

      if (result) {
        showCustomAlert(
          'Success',
          result.message ||
            'Your incident report has been submitted successfully!',
        );
      }
    } catch (error) {
      console.error('Final submission error:', error);
      showCustomAlert(
        'Submission Failed',
        error.response?.data?.message || 'Please try again later.',
      );
    } finally {
      setSubmittingFinal(false);
    }
  };

  const handleRejection = resetForm => {
    setShowAnalysisModal(false);
    setAnalysisResult(null);
    setCurrentFormData(null);
    setImagePreview(null);
    setImageData(null);
    if (resetForm) resetForm();
  };

  const handleModalClose = () => {
    setShowAnalysisModal(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            {/* Photo Capture Section */}
            <View style={styles.photoSection}>
              {!imagePreview ? (
                <TouchableOpacity
                  style={styles.photoSquare}
                  onPress={() => showImagePickerOptions(setFieldValue)}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={50}
                    color={Colors.textColor}
                    style={styles.cameraIcon}
                  />
                  <Text style={styles.photoText}>
                    Take a photo of the incident
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.photoSquareWithImage}
                  onPress={() => showImagePickerOptions(setFieldValue)}
                >
                  <Image
                    source={{ uri: imagePreview }}
                    style={styles.photoImage}
                  />
                  <View style={styles.changePhotoOverlay}>
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={24}
                      color={Colors.textColor}
                    />
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </View>
                </TouchableOpacity>
              )}

              {touched.image && errors.image && (
                <Text style={styles.error}>{errors.image}</Text>
              )}
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Incident Type</Text>
                <CustomPicker
                  selectedValue={values.type}
                  onValueChange={itemValue => setFieldValue('type', itemValue)}
                  items={types.map(type => ({
                    label: type.name,
                    value: type._id,
                  }))}
                  placeholder="Select Type"
                />
                {touched.type && errors.type && (
                  <Text style={styles.error}>{errors.type}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Severity Level</Text>
                <View style={styles.severityContainer}>
                  {severityLevels.map(level => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setFieldValue('severity', level)}
                      style={[
                        styles.severityButton,
                        values.severity === level &&
                          styles.severityButtonSelected,
                      ]}
                    >
                      <View style={styles.radioCircle}>
                        {values.severity === level && (
                          <View style={styles.selectedDot} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.severityText,
                          values.severity === level &&
                            styles.severityTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.severity && errors.severity && (
                  <Text style={styles.error}>{errors.severity}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  placeholder="e.g., Smoke seen coming from building..."
                  multiline
                  value={values.description}
                  onChangeText={handleChange('description')}
                  style={styles.textArea}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Submit Section */}
            <View style={styles.submitSection}>
              {uploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.orange} />
                  <Text style={styles.loadingText}>Analyzing incident...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.analyzeButtonText}>Analyze Report</Text>
                </TouchableOpacity>
              )}
            </View>

            <AnalysisModal
              visible={showAnalysisModal}
              analysisResult={analysisResult}
              submittingFinal={submittingFinal}
              onApprove={() => handleApproval(resetForm)}
              onReject={() => handleRejection(resetForm)}
              onRequestClose={handleModalClose}
            />

            {/* Custom Alert */}
            <CustomAlert
              visible={alertVisible}
              title={alertData.title}
              message={alertData.message}
              buttons={alertData.buttons}
              onClose={hideCustomAlert}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.blueGray,
  },
  container: {
    flex: 1,
    padding: 20,
  },

  // Photo Section Styles
  photoSection: {
    marginBottom: 30,
  },
  photoSquare: {
    width: '100%',
    height: 280, // Increased from 220 to 280
    backgroundColor: Colors.orange,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    marginBottom: 12, // Increased from 8 to 12
  },
  photoText: {
    color: Colors.textColor,
    fontSize: 16, // Increased from 14 to 16
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20, // Increased from 18 to 20
  },
  photoSquareWithImage: {
    width: '100%',
    height: 280, // Increased from 220 to 280
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12, // Increased from 8 to 12
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: Colors.textColor,
    fontSize: 14, // Increased from 12 to 14
    fontWeight: '600',
    marginTop: 4, // Increased from 2 to 4
  },
  // Form Section Styles - Updated to match SignUp
  formSection: {
    backgroundColor: Colors.darkerBlueGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textColor,
    marginBottom: 8,
  },

  // Severity Section Styles - Updated to match SignUp input style
  severityContainer: {
    gap: 12,
  },
  severityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12, // Changed from 8 to 12 to match SignUp
    borderWidth: 1,
    borderColor: Colors.orange, // Changed to match SignUp border color
    backgroundColor: Colors.blueGray, // Changed to match SignUp background
    height: 56, // Added height to match SignUp inputs
  },
  severityButtonSelected: {
    borderColor: Colors.orange,
    backgroundColor: Colors.blueGray, // Keep consistent with unselected
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.orange,
  },
  severityText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  severityTextSelected: {
    color: Colors.orange,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1, // Changed from 1.5 to 1 to match SignUp
    borderColor: Colors.orange, // Changed to match SignUp border color
    borderRadius: 12, // Changed from 8 to 12 to match SignUp
    padding: 16, // Changed from 12 to 16 to match SignUp padding
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.blueGray, // Changed to match SignUp background
    fontSize: 16,
    color: Colors.textColor,
  },

  // Submit Section Styles
  submitSection: {
    marginTop: 10,
  },
  analyzeButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonText: {
    color: Colors.textColor,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textColor, // Changed from Colors.orange to Colors.textColor
    fontWeight: '500',
  },

  // Error Styles
  error: {
    color: Colors.orange,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
});
