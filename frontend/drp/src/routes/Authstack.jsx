import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import LocationSelection from '../screens/LocationSelection';

const Stack = createStackNavigator();

export default function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9AC4F8',
        },
        headerTintColor: 'white',
        headerBackTitle: 'Back',
        headerShown: false
      }}
    >
      <Stack.Screen name="SignIn">
        {props => <SignIn {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {props => <SignUp {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen 
        name="LocationSelection" 
        component={LocationSelection}
        options={{
          headerShown: true,
          title: 'Add Locations',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
}
