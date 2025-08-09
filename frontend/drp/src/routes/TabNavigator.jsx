import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerToggleButton } from '@react-navigation/drawer';

import Home from '../screens/Home';
// import Notifications from '../screens/Notifications';
import AddIncident from '../screens/AddIncident';
import MapScreen from '../screens/MapScreen';
import AuthStack from './Authstack';
import Posts from '../screens/Posts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ setIsLoggedIn, isLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.darkestBlueGray,
        },
        headerTintColor: Colors.textColor,
        headerTitleStyle: {
          color: Colors.textColor,
        },
        headerLeft: () =>
          isLoggedIn ? (
            <DrawerToggleButton tintColor={Colors.textColor} />
          ) : null,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Map') {
            iconName = 'map-marker-outline';
          } else if (route.name === 'Posts') {
            iconName = 'post-outline';
          } else if (route.name === 'AddIncident') {
            iconName = 'plus-circle-outline';
          } else if (route.name === 'AuthStack') {
            iconName = 'login'; // Optional icon for login
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarStyle: {
          backgroundColor: Colors.darkerBlueGray,
          borderTopColor: Colors.textColor,
        },
        tabBarActiveTintColor: Colors.orange,
        tabBarInactiveTintColor: Colors.textColor,
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Posts" component={Posts} options={{ title: 'Posts' }} />
      <Tab.Screen
        name="AddIncident"
        component={AddIncident}
        options={{ title: 'Add Incident' }}
      />
      {!isLoggedIn && (
        <Tab.Screen
          name="AuthStack"
          options={{ title: 'Login', headerShown: false }}
        >
          {() => <AuthStack setIsLoggedIn={setIsLoggedIn} />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
}
