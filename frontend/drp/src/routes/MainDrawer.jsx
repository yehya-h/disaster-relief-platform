import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MainStack from './MainStack.jsx';
import Profile from '../screens/Profile.jsx';
import Posts from '../screens/Posts.jsx';
import TabNavigator from './TabNavigator.jsx';
import CustomDrawerContent from '../components/CustomDrawerContent.jsx';

const Drawer = createDrawerNavigator();
// const Stack = createNativeStackNavigator();

export default function MainDrawer({ setIsLoggedIn, isLoggedIn }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />}
      screenOptions={{
        headerShown: true, // Let drawer show the top bar with toggle
      }}
    >
      {/* <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{ headerShown: false }}
        initialParams={{ setIsLoggedIn, isLoggedIn }}
      /> */}
      <Drawer.Screen
        name="Home"
        options={{ headerShown: false }}
      >
        {() => <TabNavigator setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />}
      </Drawer.Screen>

      <Drawer.Screen name="Posts" component={Posts} />

      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}
