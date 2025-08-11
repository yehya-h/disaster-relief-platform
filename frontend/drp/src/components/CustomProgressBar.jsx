import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Colors from '../constants/colors';

const CustomProgressBar = ({ 
  visible = false, 
  text = 'Analyzing...', 
  onComplete = () => {},
  isAnalysisComplete = false 
}) => {
  const [progress] = useState(new Animated.Value(0));
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (visible && !isAnalysisComplete) {
      // Reset progress when starting
      progress.setValue(0);
      setProgressPercent(0);
      
      // Animate to 99% over 20 seconds
      Animated.timing(progress, {
        toValue: 99,
        duration: 30000, // 30 seconds
        useNativeDriver: false,
      }).start();

      // Update percentage display
      const listener = progress.addListener(({ value }) => {
        setProgressPercent(Math.round(value));
      });

      return () => {
        progress.removeListener(listener);
      };
    }
  }, [visible, isAnalysisComplete]);

  useEffect(() => {
    if (isAnalysisComplete && visible) {
      // Complete the progress bar to 100%
      Animated.timing(progress, {
        toValue: 100,
        duration: 500, // Quick completion
        useNativeDriver: false,
      }).start(() => {
        // Small delay before showing results
        setTimeout(() => {
          onComplete();
        }, 300);
      });
    }
  }, [isAnalysisComplete, visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.progressContainer}>
        <Text style={styles.titleText}>AI Analysis in Progress</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                }
              ]} 
            />
          </View>
          
          <Text style={styles.progressText}>
            {progressPercent}%
          </Text>
        </View>
        
        <Text style={styles.loadingText}>{text}</Text>
        
        <View style={styles.stepsContainer}>
          <Text style={[
            styles.stepText, 
            progressPercent >= 25 && styles.stepTextActive
          ]}>
            • Processing image...
          </Text>
          <Text style={[
            styles.stepText, 
            progressPercent >= 50 && styles.stepTextActive
          ]}>
            • Analyzing incident type...
          </Text>
          <Text style={[
            styles.stepText, 
            progressPercent >= 75 && styles.stepTextActive
          ]}>
            • Determining severity...
          </Text>
          <Text style={[
            styles.stepText, 
            progressPercent >= 95 && styles.stepTextActive
          ]}>
            • Generating report...
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  progressContainer: {
    backgroundColor: Colors.darkerBlueGray,
    borderRadius: 16,
    padding: 30,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textColor,
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.blueGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.orange,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.orange,
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textColor,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    alignSelf: 'stretch',
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '400',
  },
  stepTextActive: {
    color: Colors.orange,
    fontWeight: '500',
  },
});

export default CustomProgressBar;