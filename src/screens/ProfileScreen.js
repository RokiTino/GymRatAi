import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { authService } from '../services/auth';
import { useUserStore } from '../store/useUserStore';

export default function ProfileScreen({ navigation }) {
  const { setProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('beginner');
  const [days, setDays] = useState('3');

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getProfile(user.id);
          if (profile) {
            setGoal(profile.goal || '');
            setExperience(profile.experience_level || 'beginner');
            setDays((profile.training_days_per_week || 3).toString());
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!goal) {
      Alert.alert('Error', 'Please enter your goal');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      const profile = {
        user_id: user.id,
        goal,
        experience_level: experience,
        equipment_available: ['Gym'],
        training_days_per_week: parseInt(days),
      };
      await authService.updateProfile(profile);
      setProfile(profile);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error saving profile', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Training Goal</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Muscle Gain, Strength, Weight Loss"
          placeholderTextColor="#64748b"
          value={goal}
          onChangeText={setGoal}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Experience Level</Text>
        <View style={styles.row}>
          {['beginner', 'intermediate', 'advanced'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.pill, experience === lvl && styles.pillActive]}
              onPress={() => setExperience(lvl)}
            >
              <Text style={[styles.pillText, experience === lvl && styles.pillTextActive]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Days per Week</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.circle, days === d.toString() && styles.circleActive]}
              onPress={() => setDays(d.toString())}
            >
              <Text style={[styles.circleText, days === d.toString() && styles.circleTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save & Continue</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 24, marginTop: 40 },
  section: { marginBottom: 24 },
  label: { color: '#94a3b8', marginBottom: 8 },
  input: { backgroundColor: '#1e293b', color: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  pill: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  pillActive: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  pillText: { color: '#94a3b8', textTransform: 'capitalize' },
  pillTextActive: { color: 'white', fontWeight: '600' },
  circle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  circleActive: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  circleText: { color: '#94a3b8' },
  circleTextActive: { color: 'white', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2563eb', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
});
