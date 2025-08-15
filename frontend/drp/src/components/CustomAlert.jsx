// CustomAlert.js - Simple separate component
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import colors from '../constants/colors';
import { useTheme } from '../hooks/useThem';


const CustomAlert = ({ visible, title, message, buttons = [], onClose }) => {
    const { colors, isDarkMode } = useTheme();
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.darkerBlueGray,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 300,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textColor,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  button: {
    backgroundColor: colors.orange,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: colors.blueGray,
  },
  buttonText: {
    color: colors.textColor,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
});
  const renderButtons = () => {
    if (buttons.length === 0) {
      return (
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      );
    }

    return buttons.map((button, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.button,
          button.style === 'cancel' && styles.cancelButton,
        ]}
        onPress={() => {
          if (button.onPress) button.onPress();
          onClose();
        }}
      >
        <Text
          style={[
            styles.buttonText,
            button.style === 'cancel' && styles.cancelButtonText,
          ]}
        >
          {button.text}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttonContainer}>{renderButtons()}</View>
        </View>
      </View>
    </Modal>
  );
};



export default CustomAlert;
