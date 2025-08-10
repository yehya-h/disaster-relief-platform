// // CustomPicker.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   StyleSheet,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Colors from '../constants/colors';

// const CustomPicker = ({
//   selectedValue,
//   onValueChange,
//   items = [],
//   placeholder = 'Select an option',
//   style,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   const selectedItem = items.find(item => item.value === selectedValue);
//   const displayText = selectedItem ? selectedItem.label : placeholder;

//   const handleSelect = value => {
//     onValueChange(value);
//     setIsVisible(false);
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.option,
//         selectedValue === item.value && styles.selectedOption,
//       ]}
//       onPress={() => handleSelect(item.value)}
//     >
//       <Text
//         style={[
//           styles.optionText,
//           selectedValue === item.value && styles.selectedOptionText,
//         ]}
//       >
//         {item.label}
//       </Text>
//       {selectedValue === item.value && (
//         <Icon name="checkmark" size={20} color={Colors.orange} />
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.pickerButton, style]}
//         onPress={() => setIsVisible(true)}
//       >
//         <Text
//           style={[
//             styles.pickerButtonText,
//             !selectedValue && styles.placeholderText,
//           ]}
//         >
//           {displayText}
//         </Text>
//         <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
//       </TouchableOpacity>

//       <Modal
//         visible={isVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setIsVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Type</Text>
//               <TouchableOpacity
//                 onPress={() => setIsVisible(false)}
//                 style={styles.closeButton}
//               >
//                 <Icon name="close" size={24} color={Colors.textColor} />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={items}
//               renderItem={renderItem}
//               keyExtractor={item => item.value.toString()}
//               style={styles.optionsList}
//               showsVerticalScrollIndicator={false}
//             />
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   pickerButton: {
//     height: 50,
//     backgroundColor: Colors.darkestBlueGray,
//     borderWidth: 1.5,
//     borderColor: Colors.darkestBlueGray,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   pickerButtonText: {
//     fontSize: 16,
//     color: Colors.textColor,
//     flex: 1,
//   },
//   placeholderText: {
//     color: Colors.textSecondary,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: Colors.darkerBlueGray,
//     borderRadius: 12,
//     width: '100%',
//     maxWidth: 350,
//     maxHeight: '70%',
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.darkestBlueGray,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.textColor,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   optionsList: {
//     maxHeight: 300,
//   },
//   option: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.darkestBlueGray,
//   },
//   selectedOption: {
//     backgroundColor: Colors.darkestBlueGray,
//   },
//   optionText: {
//     fontSize: 16,
//     color: Colors.textColor,
//     flex: 1,
//   },
//   selectedOptionText: {
//     color: Colors.orange,
//     fontWeight: '600',
//   },
// });

// export default CustomPicker;
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
import Colors from '../constants/colors';

const CustomPicker = ({
  selectedValue,
  onValueChange,
  items = [],
  placeholder = 'Select an option',
  style,
}) => {
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
        styles.option,
        selectedValue === item.value && styles.selectedOption,
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text
        style={[
          styles.optionText,
          selectedValue === item.value && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {selectedValue === item.value && (
        <Icon name="checkmark" size={20} color={Colors.orange} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, style]}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !selectedValue && styles.placeholderText,
          ]}
        >
          {displayText}
        </Text>
        <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Type</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={Colors.textColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={item => item.value.toString()}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    height: 56, // Changed from 50 to 56 to match SignUp inputs
    backgroundColor: Colors.blueGray, // Changed from darkestBlueGray to blueGray
    borderWidth: 1, // Changed from 1.5 to 1 to match SignUp
    borderColor: Colors.orange, // Changed from darkestBlueGray to orange
    borderRadius: 12, // Changed from 8 to 12 to match SignUp
    paddingHorizontal: 16, // Changed from 15 to 16 to match SignUp
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: Colors.textColor,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.darkerBlueGray,
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
    borderBottomColor: Colors.darkestBlueGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textColor,
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
    borderBottomColor: Colors.darkestBlueGray,
  },
  selectedOption: {
    backgroundColor: Colors.darkestBlueGray,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textColor,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.orange,
    fontWeight: '600',
  },
});

export default CustomPicker;
