import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PhoneEntryScreen from '../screens/PhoneEntryScreen';
import HomeScreen from '../screens/HomeScreen';
import CylinderSelectionScreen from '../screens/CylinderSelectionScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CustomerCareScreen from '../screens/CustomerCareScreen';
import { getSavedProfile } from '../services/api';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null); // null = still checking

  useEffect(() => {
    getSavedProfile().then((profile) => {
      // Skip the phone entry screen if we already know this device's user
      setInitialRoute(profile?.phone ? 'Home' : 'PhoneEntry');
    });
  }, []);

  if (!initialRoute) return null; // brief blank frame while checking storage

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CylinderSelection" component={CylinderSelectionScreen} />
        <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="CustomerCare" component={CustomerCareScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
