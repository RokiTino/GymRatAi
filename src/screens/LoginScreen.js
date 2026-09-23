import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../services/auth';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setProfile } = useUserStore();

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert('Details needed', 'Enter your email and password to continue.');
      return;
    }
    setLoading(true);
    try {
      const { user, session } = await authService.signIn(email.trim(), password);
      if (!user || !session) {
        throw new Error('No active session was returned. Confirm your email and check Supabase Auth settings, then try again.');
      }
      const profile = await authService.getProfile(user.id);
      if (profile) {
        setProfile(profile);
        navigation.replace('Dashboard');
      } else {
        navigation.replace('Profile');
      }
    } catch (error) {
      Alert.alert('Sign in failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password) {
      Alert.alert('Details needed', 'Enter your email and password to create an account.');
      return;
    }
    setLoading(true);
    try {
      const { user, session } = await authService.signUp(email.trim(), password);
      if (user && session) {
        navigation.replace('Profile');
      } else if (user) {
        Alert.alert('Confirm your email', 'Your account is ready. Confirm the email, then sign in to finish your profile.');
      } else {
        throw new Error('We could not create your account. Please try again.');
      }
    } catch (error) {
      Alert.alert('Sign up failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glow} />
      <View style={styles.content}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>G</Text></View>
        <Text style={styles.brand}><Text style={styles.brandAccent}>GYM</Text>RATAI</Text>
        <Text style={styles.eyebrow}>TRAIN WITH INTENTION</Text>
        <Text style={styles.title}>Stronger starts{`\n`}right here.</Text>
        <Text style={styles.subtitle}>Your goals. Your pace. A plan that grows with you.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSignIn} disabled={loading}>
            {loading ? <ActivityIndicator color="#17151B" /> : <Text style={styles.primaryText}>Sign in  →</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.secondaryText}>New here? <Text style={styles.secondaryAccent}>Create account</Text></Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>CONSISTENCY OVER PERFECTION</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 310, height: 310, borderRadius: 155, top: -180, right: -80, backgroundColor: colors.purple, opacity: 0.2 },
  content: { paddingHorizontal: 24, paddingVertical: 25 },
  brandMark: { height: 48, width: 48, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brandGlyph: { color: colors.lime, fontSize: 26, fontWeight: '900' },
  brand: { color: colors.text, fontSize: 17, letterSpacing: 1.5, fontWeight: '900' },
  brandAccent: { color: colors.lime },
  eyebrow: { color: colors.purple, fontSize: 10, letterSpacing: 1.8, fontWeight: '900', marginTop: 26 },
  title: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '900', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  form: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 23, padding: 18 },
  label: { color: colors.text, fontWeight: '700', fontSize: 12, marginBottom: 7 },
  input: { minHeight: 50, color: colors.text, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 14, marginBottom: 16 },
  primaryButton: { height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime, marginTop: 3 },
  disabled: { opacity: 0.65 },
  primaryText: { color: '#17151B', fontSize: 14, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', padding: 15 },
  secondaryText: { color: colors.muted, fontSize: 12 },
  secondaryAccent: { color: colors.lime, fontWeight: '800' },
  footer: { color: colors.muted, fontSize: 9, letterSpacing: 1.7, fontWeight: '700', textAlign: 'center', marginTop: 23 },
});
