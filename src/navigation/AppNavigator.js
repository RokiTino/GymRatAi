import React, { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Button, Text, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DashboardScreen from "../screens/DashboardScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import PlanGenScreen from "../screens/PlanGenScreen";
import NutritionProfileScreen from "../screens/NutritionProfileScreen";
import { colors } from "../theme";
import { supabase } from "../services/supabaseClient";
import { authService } from "../services/auth";
import { useUserStore } from "../store/useUserStore";

const Stack = createStackNavigator();
export default function AppNavigator() {
  const [userId, setUserId] = useState(undefined);
  const [readyFor, setReadyFor] = useState(null);
  const [initialRoute, setInitialRoute] = useState("Profile");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let authEventSeen = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventSeen = true;
      if (active) setUserId(session?.user.id ?? null);
    });
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active || authEventSeen) return;
        if (sessionError)
          setError("Could not restore your session. Please sign in again.");
        setUserId(data.session?.user.id ?? null);
      })
      .catch(() => {
        if (active) {
          setError("Could not restore your session.");
          setUserId(null);
        }
      });
    const refresh = (state) =>
      state === "active"
        ? supabase.auth.startAutoRefresh()
        : supabase.auth.stopAutoRefresh();
    refresh(AppState.currentState);
    const appState = AppState.addEventListener("change", refresh);
    return () => {
      active = false;
      subscription.unsubscribe();
      appState.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
  useEffect(() => {
    let active = true;
    setReadyFor(null);
    useUserStore.getState().clearUser();
    if (!userId) return;
    setError("");
    authService
      .getProfile(userId)
      .then((profile) => {
        if (!active) return;
        useUserStore.getState().setProfile(profile);
        setInitialRoute(profile ? "Dashboard" : "Profile");
        setReadyFor(userId);
      })
      .catch(() => {
        if (active)
          setError(
            "Could not load your training profile. Check your connection and retry.",
          );
      });
    return () => {
      active = false;
    };
  }, [userId, attempt]);
  if (!supabase)
    return (
      <View style={{ flex: 1, padding: 28, justifyContent: "center" }}>
        <Text style={{ color: colors.text }}>
          GymRatAI is not configured. Add the GymRatAI Supabase connection to
          this cloud build.
        </Text>
      </View>
    );
  if (userId === undefined || (userId && readyFor !== userId))
    return (
      <View style={{ flex: 1, padding: 28, justifyContent: "center", gap: 16 }}>
        {error ? (
          <>
            <Text accessibilityRole="alert" style={{ color: colors.text }}>
              {error}
            </Text>
            <Button title="Retry" onPress={() => setAttempt((n) => n + 1)} />
            <Button
              title="Sign out"
              onPress={() =>
                supabase.auth.signOut().then(({ error }) => {
                  if (error) setError(error.message);
                })
              }
            />
          </>
        ) : (
          <ActivityIndicator color={colors.lime} />
        )}
      </View>
    );
  return (
    <Stack.Navigator
      key={userId || "signed-out"}
      initialRouteName={userId ? initialRoute : "Login"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
      }}
    >
      {userId ? (
        <>
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="PlanGen" component={PlanGenScreen} />
          <Stack.Screen
            name="NutritionProfile"
            component={NutritionProfileScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
