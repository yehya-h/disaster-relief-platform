import { Text, View, StyleSheet } from 'react-native';

const ShelterMarker = ({ size }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
        <View style={[styles.shelterMarker, { width: size, height: size }]}>
            <View style={styles.shelterIcon}>
                <Text style={[styles.markerText, { fontSize: size * 0.4 }]}>S</Text>
            </View>
        </View>
        <View style={[styles.markerShadow, { width: size, height: size }]} />
    </View>
);

export default ShelterMarker;


const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shelterMarker: {
        backgroundColor: '#4CAF50', // Green
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
    shelterIcon: {
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