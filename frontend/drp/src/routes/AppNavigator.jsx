import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './Authstack.jsx';
import MainDrawer from './MainDrawer.jsx';

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainDrawer />
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}
