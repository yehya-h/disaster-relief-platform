import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import IncidentMarker from '../../mapComponents/incidentMarker';
import LiveLocationMarker from '../../mapComponents/liveLocationMarker';
import { useTheme } from '../../hooks/useThem';
import { useFocusEffect } from '@react-navigation/native';

interface LocationMapProps {
  latitude: number;          // User latitude
  longitude: number;         // User longitude
  height?: number;
  width?: number;
  regionName: string;        // Name for user location
  hitAreas?: any[];          // Array of incidents
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  height = 300,
  width = 300,
  regionName,
  hitAreas = [],
}) => {
  const { colors } = useTheme();
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setShouldRenderMap(true);

      return () => {
        // Screen is unfocused, cleanup map
        setShouldRenderMap(false);
      };
    }, []),
  );

  return (
    <View style={[styles.container, { width, height }]}>
      {shouldRenderMap && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled
          zoomEnabled
          rotateEnabled
          pitchEnabled={false}
        >
          {/* User Location Marker */}
          <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }}>
            <LiveLocationMarker size={28} />
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Your Location</Text>
                <Text style={styles.calloutText}>{regionName}</Text>
              </View>
            </Callout>
          </Marker>

          {/* Incident Markers */}
          {hitAreas.map((incident, idx) => {
            const coords = incident.location?.coordinates;
            if (!coords || coords.length !== 2) return null;

            const lat = coords[1];
            const lng = coords[0];

            return (
              <React.Fragment key={`incident-${idx}`}>
                {/* Incident Marker */}
                <Marker coordinate={{ latitude: lat, longitude: lng }} anchor={{ x: 0.5, y: 0.5 }}>
                  <IncidentMarker size={28} />
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>
                        {incident.title || 'Emergency Incident'}
                      </Text>
                      {incident.type && (
                        <Text style={[styles.calloutText, styles.typeText]}>
                          Type: {incident.type}
                        </Text>
                      )}
                      {incident.description && (
                        <Text style={styles.calloutText}>{incident.description}</Text>
                      )}
                      {incident.severity && (
                        <Text style={[styles.calloutText, styles.severityText]}>
                          Severity: {incident.severity}
                        </Text>
                      )}
                    </View>
                  </Callout>
                </Marker>

                {/* Danger Zone Circle */}
                <Circle
                  center={{ latitude: lat, longitude: lng }}
                  radius={500}
                  strokeWidth={2}
                  strokeColor="rgba(255,0,0,0.7)"
                  fillColor="rgba(255,0,0,0.2)"
                />
              </React.Fragment>
            );
          })}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  calloutContainer: {
    minWidth: 150,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  typeText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  severityText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default LocationMap;
