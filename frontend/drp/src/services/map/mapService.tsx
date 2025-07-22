import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

// Add gray map style
const grayMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#e0e0e0' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#bdbdbd' }],
  },
];

interface LocationMapProps {
  latitude: number;
  longitude: number;
  height?: number;
  width?: number;
  regionName: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  height = 300,
  width = 300,
  regionName,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.002, // More zoomed in
          longitudeDelta: 0.002,
        }}
        customMapStyle={grayMapStyle}
        scrollEnabled={false}
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }}>
          <Callout>
            <View>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{regionName}</Text>
              </View>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
  },
});

export default LocationMap;
