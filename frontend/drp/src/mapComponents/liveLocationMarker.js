import { Text, View, StyleSheet } from 'react-native';

const LiveLocationMarker = ({ size = 24 }) => (
    <View style={[styles.markerContainer, { width: size, height: size }]}>
        <View style={[styles.liveMarker, { width: size, height: size }]}>
            <View
                style={[
                    styles.liveMarkerInner,
                    {
                        width: size * 0.6,
                        height: size * 0.6,
                    },
                ]}
            />
        </View>
        <View
            style={[
                styles.liveMarkerPulse,
                { width: size * 1.5, height: size * 1.5 },
            ]}
        />
    </View>
);

export default LiveLocationMarker;

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    liveMarker: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
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
    liveMarkerInner: {
        backgroundColor: '#007AFF',
        borderRadius: 999,
    },
    liveMarkerPulse: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        borderRadius: 999,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -0.75 }, { translateY: -0.75 }],
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