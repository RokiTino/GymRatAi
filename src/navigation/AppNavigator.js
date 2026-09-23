import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import PlanGenScreen from '../screens/PlanGenScreen';
import NutritionProfileScreen from '../screens/NutritionProfileScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="PlanGen" component={PlanGenScreen} />
      <Stack.Screen name="NutritionProfile" component={NutritionProfileScreen} />
    </Stack.Navigator>
  );
}
