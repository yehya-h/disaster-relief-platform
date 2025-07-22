import React from 'react';
import DisasterMap from '../components/DisasterMap';

export default function MapScreen() {
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const shelters = [
    {
      id: 1,
      name: 'Main Shelter',
      latitude: 37.78925,
      longitude: -122.4324,
      capacity: 200
    },
    // ... more shelters
  ];

  const incidents = [
    {
      id: 1,
      type: 'Flood',
      latitude: 37.78815,
      longitude: -122.4314,
      description: 'Major flooding reported'
    },
    // ... more incidents
  ];

  return (
    <DisasterMap 
      shelters={shelters}
      incidents={incidents}
      initialRegion={initialRegion}
    />
  );
}
