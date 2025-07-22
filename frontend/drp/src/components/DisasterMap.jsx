import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const DisasterMap = ({ shelters, incidents, initialRegion }) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* Render shelter markers */}
        {shelters.map((shelter, index) => (
          <Marker
            key={`shelter-${index}`}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            title={shelter.name}
            description={shelter.capacity ? `Capacity: ${shelter.capacity}` : ''}
            image={require('../assets/icons/shelter-icon.png')} // Your custom shelter icon
          />
        ))}
        
        {/* Render incident markers */}
        {incidents.map((incident, index) => (
          <Marker
            key={`incident-${index}`}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.type}
            description={incident.description}
            image={require('../assets/icons/incident-icon.png')} // Your custom incident icon
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default DisasterMap;