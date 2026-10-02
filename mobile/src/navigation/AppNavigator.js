import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CylinderSelectionScreen from '../screens/CylinderSelectionScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CustomerCareScreen from '../screens/CustomerCareScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
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
