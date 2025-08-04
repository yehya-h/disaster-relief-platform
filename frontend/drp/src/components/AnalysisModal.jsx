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
      <ScrollView style={styles.modalContainer}>
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
                    <ActivityIndicator color="white" />
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  analysisSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  confidenceText: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '600',
  },
  analysisText: {
    fontSize: 16,
    color: '#495057',
    textTransform: 'capitalize',
  },
  reasoningText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  approvalQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalysisModal;