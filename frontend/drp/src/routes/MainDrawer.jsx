import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MainStack from './MainStack.jsx';
import Profile from '../screens/Profile.jsx';
import UpdatePassword from '../screens/UpdatePassword.jsx';
import UpdateLocations from '../screens/UpdateLocations.jsx';
// import Posts from '../screens/Posts.jsx';
import TabNavigator from './TabNavigator.jsx';
import CustomDrawerContent from '../components/CustomDrawerContent.jsx';
import Notifications from '../screens/Notifications.jsx';
import NotificationDetails from '../screens/NotificationsDetails.jsx';
import Colors from '../constants/colors.js';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function NotificationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Notifications" 
        component={Notifications} 
        options={{ 
          title: 'Notifications',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="NotificationDetails" 
        component={NotificationDetails} 
        options={{ 
          title: 'Incident Details',
          headerShown: false 
        }} 
      />
    </Stack.Navigator>
  );
}

export default function MainDrawer({ setIsLoggedIn, isLoggedIn }) {
  return (
    <Drawer.Navigator
      drawerContent={props => (
        <CustomDrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />
      )}
      screenOptions={{
        headerShown: true,
        // Consistent drawer item styling
        drawerActiveTintColor: Colors.orange,
        drawerInactiveTintColor: Colors.textColor,
        drawerStyle: {
          backgroundColor: Colors.darkerBlueGray,
        },
        // Consistent drawer item appearance
        drawerItemStyle: {
          borderBottomWidth: 1,
          borderBottomColor: Colors.darkestBlueGray,
          borderRadius: 0, // Remove default rounded corners
          marginVertical: 0,
          marginHorizontal: 0,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -16, // Align with custom drawer content
        },
        // Header styling
        headerStyle: {
          backgroundColor: Colors.darkestBlueGray,
        },
        headerTintColor: Colors.textColor,
        headerTitleStyle: {
          color: Colors.textColor,
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          headerShown: false,
          // Hide from drawer menu since it's handled by CustomDrawerContent
          drawerItemStyle: { display: 'none' },
        }}
      >
        {() => (
          <TabNavigator setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="Notifications"
        component={NotificationsStack}
                options={{ title: 'Notifications', headerShown: false }}

      />

      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          // Hide from drawer menu since it's handled by CustomDrawerContent
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="UpdatePassword"
        component={UpdatePassword}
        options={{
          headerShown: false,
          // Hide from drawer menu since it's handled by CustomDrawerContent
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="UpdateLocations"
        component={UpdateLocations}
        options={{
          headerShown: false,
          // Hide from drawer menu since it's handled by CustomDrawerContent
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}
