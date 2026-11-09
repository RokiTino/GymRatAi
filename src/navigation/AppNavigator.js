import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import PlanGenScreen from '../screens/PlanGenScreen';
import NutritionProfileScreen from '../screens/NutritionProfileScreen';
import { authService } from '../services/auth';
import { supabase } from '../services/supabaseClient';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [startupError, setStartupError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      if (mounted) {
        setSession(nextSession);
        setAuthReady(true);
        setStartupError(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: storedSession }, error }) => {
      if (!mounted || authEventReceived) return;
      if (error) {
        setStartupError(true);
      } else {
        setSession(storedSession);
      }
      setAuthReady(true);
    }).catch(() => {
      if (mounted && !authEventReceived) {
        setStartupError(true);
        setAuthReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return undefined;
    let mounted = true;

    if (!session?.user?.id) {
      useUserStore.getState().clearUser();
      setProfileExists(false);
      setProfileReady(true);
      setStartupError(false);
      return () => { mounted = false; };
    }

    setProfileReady(false);
    authService.getCurrentUser()
      .then((user) => {
        if (!user) throw new Error('Your session could not be verified.');
        return authService.getProfile(user.id);
      })
      .then((profile) => {
        if (!mounted) return;
        useUserStore.getState().setProfile(profile);
        setProfileExists(Boolean(profile));
        setStartupError(false);
        setProfileReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setStartupError(true);
        setProfileReady(true);
      });

    return () => { mounted = false; };
  }, [authReady, session?.user?.id, retryCount]);

  if (!authReady || (session && !profileReady)) {
    return <View style={styles.stateScreen}>
      <ActivityIndicator color={colors.lime} />
      <Text style={styles.stateText}>Restoring your training space…</Text>
    </View>;
  }

  if (startupError) {
    return <View style={styles.stateScreen}>
      <Text style={styles.errorTitle}>We couldn’t restore your session</Text>
      <Text style={styles.stateText}>Check your connection and try again.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => {
        setStartupError(false);
        setProfileReady(false);
        setRetryCount((count) => count + 1);
      }} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
      {session ? <TouchableOpacity onPress={() => authService.signOut().catch((error) => Alert.alert('Sign out failed', error.message))} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity> : null}
    </View>;
  }

  return (
    <Stack.Navigator
      key={session?.user?.id || 'signed-out'}
      initialRouteName={!session ? 'Login' : profileExists ? 'Dashboard' : 'Profile'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
      }}
    >
      {!session ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="PlanGen" component={PlanGenScreen} />
          <Stack.Screen name="NutritionProfile" component={NutritionProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  stateScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: colors.background },
  stateText: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 21 },
  errorTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  retryButton: { minWidth: 150, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 22, borderRadius: 14, backgroundColor: colors.lime },
  retryText: { color: '#17151B', fontWeight: '900' },
  signOutText: { color: colors.muted, marginTop: 18, fontSize: 13 },
});
