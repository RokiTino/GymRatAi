import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { authService } from '../services/auth';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme';

const experiences = ['beginner', 'intermediate', 'advanced'];
const trainingDays = [1, 2, 3, 4, 5, 6];

export default function ProfileScreen({ navigation }) {
  const { setProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('beginner');
  const [days, setDays] = useState('3');

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return;
        const profile = await authService.getProfile(user.id);
        if (mounted && profile) {
          setGoal(profile.goal || '');
          setExperience(profile.experience_level || 'beginner');
          setDays(String(profile.training_days_per_week || 3));
        }
      } catch (error) {
        console.warn('Profile could not be loaded', error?.message);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    if (!goal.trim()) {
      Alert.alert('Add your training goal', 'Enter a goal before continuing.');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Your sign-in session has expired. Sign in again to save your profile.');
      const profile = {
        user_id: user.id,
        goal: goal.trim(),
        experience_level: experience,
        equipment_available: ['Gym'],
        training_days_per_week: Number.parseInt(days, 10),
      };
      await authService.updateProfile(profile);
      setProfile(profile);
      navigation.replace('Dashboard', { notice: 'Training profile saved. Your dashboard is ready.' });
    } catch (error) {
      Alert.alert('Profile not saved', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <AppHeader navigation={navigation} title="Training profile" fallbackRoute="Login" />
      <Text style={styles.eyebrow}>LET'S GET STARTED</Text>
      <Text style={styles.title}>Your training, your way.</Text>
      <Text style={styles.subtitle}>A few details help us shape your experience.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>What's your main goal?</Text>
        <TextInput
          style={styles.input}
          placeholder="Build strength, gain muscle…"
          placeholderTextColor={colors.muted}
          value={goal}
          onChangeText={setGoal}
          returnKeyType="done"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Experience level</Text>
        <View style={styles.row}>
          {experiences.map((level) => {
            const selected = experience === level;
            return (
              <TouchableOpacity key={level} style={[styles.pill, selected && styles.pillSelected]} onPress={() => setExperience(level)}>
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>How many days can you train?</Text>
        <View style={styles.row}>
          {trainingDays.map((day) => {
            const selected = days === String(day);
            return (
              <TouchableOpacity key={day} style={[styles.day, selected && styles.daySelected]} onPress={() => setDays(String(day))}>
                <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.helper}>days per week</Text>
      </View>

      <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#17151B" /> : <Text style={styles.buttonText}>Save & continue  →</Text>}
      </TouchableOpacity>
      <Text style={styles.footer}>You can update your training profile any time.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginBottom: 10 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 8, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 17, marginBottom: 12 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 13 },
  input: { minHeight: 52, backgroundColor: colors.background, color: colors.text, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { flex: 1, paddingHorizontal: 8, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  pillSelected: { backgroundColor: colors.purple, borderColor: colors.purple },
  pillText: { color: colors.muted, fontSize: 11, textTransform: 'capitalize' },
  pillTextSelected: { color: colors.text, fontWeight: '800' },
  day: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  daySelected: { backgroundColor: colors.lime, borderColor: colors.lime },
  dayText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  dayTextSelected: { color: '#17151B' },
  helper: { color: colors.muted, fontSize: 11, marginTop: 10 },
  primaryButton: { backgroundColor: colors.lime, minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 11 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#17151B', fontWeight: '900', fontSize: 15 },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: 16 },
});
