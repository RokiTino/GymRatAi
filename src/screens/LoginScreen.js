import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { authService } from '../services/auth';
import { useUserStore } from '../store/useUserStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setProfile } = useUserStore();

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const { user } = await authService.signIn(email, password);
      if (user) {
        const profile = await authService.getProfile(user.id);
        if (profile) {
          setProfile(profile);
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Profile');
        }
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const { user } = await authService.signUp(email, password);
      if (user) {
        navigation.replace('Profile');
      }
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GymRatAi</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Don't have an account? <Text style={{color: '#3b82f6'}}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 24 },
  title: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 32 },
  inputContainer: { width: '100%', marginBottom: 32 },
  input: { backgroundColor: '#1e293b', color: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  primaryButton: { backgroundColor: '#2563eb', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
  secondaryButton: { width: '100%', padding: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#94a3b8', fontWeight: '500' },
});
