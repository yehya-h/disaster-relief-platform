// CustomPicker.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useThem'; // Assuming this is the correct path

const CustomPicker = ({
  selectedValue,
  onValueChange,
  items = [],
  placeholder = 'Select an option',
  style,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  const handleSelect = value => {
    onValueChange(value);
    setIsVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles(colors).option,
        selectedValue === item.value && styles(colors).selectedOption,
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text
        style={[
          styles(colors).optionText,
          selectedValue === item.value && styles(colors).selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {selectedValue === item.value && (
        <Icon name="checkmark" size={20} color={colors.orange} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles(colors).pickerButton, style]}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[
            styles(colors).pickerButtonText,
            !selectedValue && styles(colors).placeholderText,
          ]}
        >
          {displayText}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles(colors).modalOverlay}>
          <View style={styles(colors).modalContainer}>
            <View style={styles(colors).modalHeader}>
              <Text style={styles(colors).modalTitle}>Select Type</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles(colors).closeButton}
              >
                <Icon name="close" size={24} color={colors.textColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={item => item.value.toString()}
              style={styles(colors).optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = (colors) => StyleSheet.create({
  pickerButton: {
    height: 56, // Changed from 50 to 56 to match SignUp inputs
    backgroundColor: colors.blueGray, // Changed from darkestBlueGray to blueGray
    borderWidth: 1, // Changed from 1.5 to 1 to match SignUp
    borderColor: colors.orange, // Changed from darkestBlueGray to orange
    borderRadius: 12, // Changed from 8 to 12 to match SignUp
    paddingHorizontal: 16, // Changed from 15 to 16 to match SignUp
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.textColor,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.darkerBlueGray,
    borderRadius: 12,
    width: '100%',
    maxWidth: 350,
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkestBlueGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textColor,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkestBlueGray,
  },
  selectedOption: {
    backgroundColor: colors.darkestBlueGray,
  },
  optionText: {
    fontSize: 16,
    color: colors.textColor,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.orange,
    fontWeight: '600',
  },
});

export default CustomPicker;