import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Colors from '../constants/colors';

const CustomLoader = ({ 
  visible = false, 
  text = 'Loading...', 
  size = 'large',
  color = Colors.orange 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.loaderCard}>
        <ActivityIndicator 
          size={size} 
          color={color} 
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderCard: {
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginBottom: 16,
    transform: [{ scale: 1.5 }], // Make spinner bigger
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textColor,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default CustomLoader;