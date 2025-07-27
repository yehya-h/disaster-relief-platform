import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MainStack from './MainStack.jsx';
import Profile from '../screens/Profile.jsx';
import Posts from '../screens/Posts.jsx';
import TabNavigator from './TabNavigator.jsx';

// const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

export default function MainDrawer() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true, // Let drawer show the top bar with toggle
      }}
    >
      <Stack.Screen
        name="Homee"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Posts" component={Posts} />

      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
