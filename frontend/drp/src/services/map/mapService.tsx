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
  hitAreas?: any[];
}

const TriangleMarker = () => (
  <View style={triangleStyles.triangle} />
);

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  height = 300,
  width = 300,
  regionName,
  hitAreas = [],
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.009, // More zoomed in
          longitudeDelta: 0.009,
        }}
        customMapStyle={grayMapStyle}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={false}
      >
        {/* User location marker */}
        <Marker coordinate={{ latitude, longitude }}>
          <Callout>
            <View>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{regionName}</Text>
              </View>
            </View>
          </Callout>
        </Marker>
        {/* Hit area triangle markers */}
        {hitAreas.map((incident, idx) => {
          const coords = incident.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          return (
            <Marker
              key={`hitarea-${idx}`}
              coordinate={{ latitude: coords[1], longitude: coords[0] }}
              title={incident.type || 'Disaster Hit Area'}
              description={incident.description || ''}
            >
              <TriangleMarker />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const triangleStyles = StyleSheet.create({
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#d90a0aff', // Red triangle
    alignSelf: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
  },
});

export default LocationMap;
