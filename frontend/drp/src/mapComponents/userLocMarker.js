import { Text, View, StyleSheet } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const UserLocMarker = ({ size }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
        <View style={[styles.userLocMarker, { width: size, height: size }]}>
            <View style={styles.userLocIcon}>
                <MaterialIcons name="person-pin-circle" style={[styles.markerText,{fontSize: size * 0.6}]} color="#ffffff" />
            </View>
        </View>
        <View style={[styles.markerShadow, { width: size, height: size }]} />
    </View>
);

export default UserLocMarker;


const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userLocMarker: {
        backgroundColor: '#36d8f4ff', // Cyan
        borderRadius: 999,
        borderWidth: 3,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userLocIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Shadow for all markers
    markerShadow: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 999,
        top: 2,
        left: 0,
        zIndex: -1,
    },
});