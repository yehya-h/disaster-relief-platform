import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
// import MainStack from './MainStack.jsx';
import Profile from '../screens/Profile.jsx';
import Posts from '../screens/Posts.jsx';
import TabNavigator from './TabNavigator.jsx';

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true, // Let drawer show the top bar with toggle
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="Posts" component={Posts} />

      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}
