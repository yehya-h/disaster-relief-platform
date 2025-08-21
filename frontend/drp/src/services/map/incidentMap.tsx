// IncidentMap.tsx
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, DimensionValue, Text } from 'react-native';
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import IncidentMarker from '../../mapComponents/incidentMarker'; // adjust path if needed
import { useTheme } from '../../hooks/useThem';
import { useFocusEffect } from '@react-navigation/native';

interface IncidentMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
  width?: DimensionValue;
  markerSize?: number;
  showDangerZone?: boolean;
  incident?: {
    typeId?: string;
    description?: string;
    severity?: string | number;
  } | null;
}

const IncidentMap: React.FC<IncidentMapProps> = ({
  latitude,
  longitude,
  title = 'Emergency Incident',
  height = 300,
  width = '100%',
  markerSize = 28,
  showDangerZone = true,
  incident = null,
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

  const styles = StyleSheet.create({
    mapCard: {
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      backgroundColor: '#fff',
      marginVertical: 10,
    },
    map: {
      flex: 1,
    },
    calloutContainer: {
      minWidth: 150,
      padding: 10,
    },
    calloutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: colors.textColor ?? '#333',
    },
    calloutText: {
      fontSize: 14,
      color: colors.textSecondary ?? '#666',
      marginBottom: 3,
    },
    calloutLabel: {
      fontSize: 12,
      color: '#4CAF50',
      fontWeight: 'bold',
      marginTop: 5,
    },
    severityText: {
      color: '#F44336',
      fontWeight: 'bold',
    },
    typeText: {
      color: '#2196F3',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={[styles.mapCard, { height, width }]}>
      {shouldRenderMap && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          zoomEnabled
          scrollEnabled
        >
          <Marker
            coordinate={{ latitude, longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <IncidentMarker size={markerSize} />

            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{title}</Text>

                {/* If an incident object is passed, show same fields as DisasterMap */}
                {incident?.typeId && (
                  <Text style={[styles.calloutText, styles.typeText]}>
                    Type: {incident.typeId}
                  </Text>
                )}

                {incident?.description && (
                  <Text style={styles.calloutText}>{incident.description}</Text>
                )}

                {incident?.severity !== undefined && (
                  <Text style={[styles.calloutText, styles.severityText]}>
                    Severity: {incident.severity}
                  </Text>
                )}

                {/* fallback label */}
                {!incident && <Text style={styles.calloutLabel}>Incident</Text>}
              </View>
            </Callout>
          </Marker>

          {/* Danger zone circle (500m) to match DisasterMap */}
          {showDangerZone && (
            <Circle
              center={{ latitude, longitude }}
              radius={100}
              strokeWidth={2}
              strokeColor="rgba(255,0,0,0.7)"
              fillColor="rgba(255,0,0,0.2)"
            />
          )}
        </MapView>
      )}
    </View>
  );
};

export default IncidentMap;
