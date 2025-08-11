import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Colors from '../constants/colors'; // Import Colors to match AddIncident

const AnalysisModal = ({
  visible,
  analysisResult,
  submittingFinal,
  onApprove,
  onReject,
  onRequestClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Incident Analysis Results</Text>

            {analysisResult && (
              <>
                <View style={styles.analysisSection}>
                  <Text style={styles.sectionTitle}>AI Confidence:</Text>
                  <Text style={styles.confidenceText}>
                    {Math.round(analysisResult.probability * 100)}% confident this
                    is a real incident
                  </Text>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.sectionTitle}>Detected Type:</Text>
                  <Text style={styles.analysisText}>{analysisResult.type}</Text>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.sectionTitle}>Severity Level:</Text>
                  <Text style={styles.analysisText}>
                    {analysisResult.severity}
                  </Text>
                </View>

                {/* {analysisResult.reasoning && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>AI Reasoning:</Text>
                    <Text style={styles.reasoningText}>
                      {analysisResult.reasoning}
                    </Text>
                  </View>
                )} */}

                <View style={styles.analysisSection}>
                  <Text style={styles.sectionTitle}>
                    Reformulated Description:
                  </Text>
                  <Text style={styles.descriptionText}>
                    {analysisResult.reformulated_description}
                  </Text>
                </View>

                <Text style={styles.approvalQuestion}>
                  Do you want to submit this incident report?
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={onReject}
                    disabled={submittingFinal}
                  >
                    <Text style={styles.rejectButtonText}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={onApprove}
                    disabled={submittingFinal}
                  >
                    {submittingFinal ? (
                      <ActivityIndicator color={Colors.textColor} />
                    ) : (
                      <Text style={styles.approveButtonText}>
                        Yes, Submit Report
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.blueGray, // Match AddIncident background
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.darkerBlueGray, // Match AddIncident form section
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.textColor, // Match AddIncident text color
    letterSpacing: 0.5,
  },
  analysisSection: {
    marginBottom: 24, // Match AddIncident inputGroup spacing
    padding: 16,
    backgroundColor: Colors.blueGray, // Subtle contrast within modal
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.orange, // Match AddIncident border style
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.textColor, // Match AddIncident label color
  },
  confidenceText: {
    fontSize: 18,
    color: Colors.orange, // Use theme color instead of green
    fontWeight: '600',
  },
  analysisText: {
    fontSize: 16,
    color: Colors.textColor, // Match AddIncident text color
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  reasoningText: {
    fontSize: 14,
    color: Colors.textSecondary, // Match AddIncident secondary text
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textColor, // Match AddIncident text color
    lineHeight: 20,
    fontStyle: 'italic',
  },
  approvalQuestion: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 30, // Increased spacing
    color: Colors.textColor, // Match AddIncident text color
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12, // Add gap between buttons
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16, // Match AddIncident button padding
    borderRadius: 12, // Match AddIncident button radius
    alignItems: 'center',
    justifyContent: 'center',
    height: 56, // Match AddIncident button height
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  rejectButton: {
    backgroundColor: Colors.darkerBlueGray, // Use theme color
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  approveButton: {
    backgroundColor: Colors.orange, // Match AddIncident primary button
  },
  rejectButtonText: {
    color: Colors.textColor, // Match theme text color
    fontSize: 16,
    fontWeight: '600',
  },
  approveButtonText: {
    color: Colors.textColor, // Match AddIncident button text
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AnalysisModal;