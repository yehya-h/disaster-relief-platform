import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerToggleButton } from '@react-navigation/drawer';

import Home from '../screens/Home';
import Notifications from '../screens/Notifications';
import AddIncident from '../screens/AddIncident';
import MapScreen from '../screens/MapScreen';
import AuthStack from './Authstack';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ setIsLoggedIn, isLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerLeft: () =>{
          if(isLoggedIn){
            return <DrawerToggleButton />;
          }
          return null;
        },
        // headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="AddIncident"
        component={AddIncident}
        options={{ title: 'Add Incident' }}
      />
      {
        !isLoggedIn && (
          <Tab.Screen
            name="AuthStack"
            options={{ title: 'Login', headerShown: false }}
          >
            {() => <AuthStack setIsLoggedIn={setIsLoggedIn} />}
          </Tab.Screen>
        )
      }
    </Tab.Navigator>
  );
}
