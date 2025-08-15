import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { toggleTheme } from '../redux/ThemeSlice';
import { useTheme } from '../hooks/useThem'

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleToggle}>
      <MaterialCommunityIcons
        name={isDarkMode ? 'weather-sunny' : 'weather-night'}
        size={22}
        color={colors.textColor}
      />
      <Text style={[styles.text, { color: colors.textColor }]}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </Text>
    </TouchableOpacity>
  );
};



export default ThemeToggle;