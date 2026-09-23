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
import { loadNutritionProfile, saveNutritionProfile } from '../services/nutritionService';

const COLORS = {
  background: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#f8fafc',
  muted: '#94a3b8',
  accent: '#2563eb',
  success: '#34d399',
};

const activities = [
  ['sedentary', 'Sedentary'],
  ['lightly_active', 'Lightly active'],
  ['moderately_active', 'Moderately active'],
  ['very_active', 'Very active'],
  ['extremely_active', 'Extremely active'],
];
const goals = [['lose', 'Lose weight'], ['maintain', 'Maintain'], ['gain', 'Gain weight']];
const approaches = [
  ['omni', 'Balanced'],
  ['highProtein', 'High protein'],
  ['pesc', 'Pescatarian'],
  ['veg', 'Vegetarian'],
  ['vegan', 'Vegan'],
  ['keto', 'Keto'],
  ['mediterranean', 'Mediterranean'],
];
const allergyOptions = ['dairy', 'egg', 'fish', 'shellfish', 'peanut', 'treenut', 'gluten', 'soy', 'sesame'];

function ChoiceRow({ options, value, onChange, wrap = false }) {
  return (
    <View style={[styles.choiceRow, wrap && styles.choiceWrap]}>
      {options.map(([optionValue, label]) => {
        const active = value === optionValue;
        return (
          <TouchableOpacity
            key={optionValue}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(optionValue)}
            style={[styles.choice, active && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function NutritionProfileScreen({ navigation }) {
  const [form, setForm] = useState({
    age: '',
    sex: '',
    height: '',
    height_unit: 'cm',
    weight: '',
    weight_unit: 'kg',
    activity_level: '',
    weight_goal: '',
    approach: 'omni',
    allergies: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    loadNutritionProfile()
      .then(({ profile }) => {
        if (active && profile) setForm((current) => ({ ...current, ...profile }));
      })
      .catch((error) => {
        console.warn('Nutrition profile could not be loaded', error?.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function toggleAllergy(allergy) {
    setForm((current) => ({
      ...current,
      allergies: current.allergies.includes(allergy)
        ? current.allergies.filter((item) => item !== allergy)
        : [...current.allergies, allergy],
    }));
  }

  async function handleSave() {
    if (!form.age || !form.sex || !form.height || !form.weight ||
        !form.activity_level || !form.weight_goal) {
      Alert.alert('Complete your details', 'Fill in each required field before saving.');
      return;
    }
    setSaving(true);
    try {
      const result = await saveNutritionProfile({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
      Alert.alert(
        'Saved securely',
        result.integration === 'awaiting_myfitnesspal_partner_access'
          ? 'Your nutrition profile is encrypted in Supabase. MyFitnessPal transfer will be enabled after partner API access is approved.'
          : 'Your nutrition profile was saved.'
      );
    } catch (error) {
      Alert.alert('Could not save', error?.message || 'Sign in and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color={COLORS.accent} />
        <Text style={styles.muted}>Loading your encrypted nutrition profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </TouchableOpacity>
      <Text style={styles.eyebrow}>NUTRITION</Text>
      <Text style={styles.title}>Your nutrition profile</Text>
      <Text style={styles.subtitle}>
        Used to personalize calorie, macro, and meal recommendations. You must be 18 or older.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={form.age}
          onChangeText={(value) => update('age', value.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="Age (18+)"
          placeholderTextColor="#64748b"
          maxLength={3}
        />
        <Text style={styles.label}>Biological sex</Text>
        <ChoiceRow options={[['male', 'Male'], ['female', 'Female']]} value={form.sex} onChange={(value) => update('sex', value)} />

        <Text style={styles.label}>Height</Text>
        <View style={styles.measureRow}>
          <TextInput
            style={[styles.input, styles.measureInput]}
            value={form.height}
            onChangeText={(value) => update('height', value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder={form.height_unit === 'cm' ? 'Height in cm' : 'Height in inches'}
            placeholderTextColor="#64748b"
          />
          <ChoiceRow options={ [['cm', 'cm'], ['inches', 'in']] } value={form.height_unit} onChange={(value) => update('height_unit', value)} />
        </View>

        <Text style={styles.label}>Current weight</Text>
        <View style={styles.measureRow}>
          <TextInput
            style={[styles.input, styles.measureInput]}
            value={form.weight}
            onChangeText={(value) => update('weight', value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder={form.weight_unit === 'kg' ? 'Weight in kg' : 'Weight in lb'}
            placeholderTextColor="#64748b"
          />
          <ChoiceRow options={ [['kg', 'kg'], ['lb', 'lb']] } value={form.weight_unit} onChange={(value) => update('weight_unit', value)} />
        </View>

        <Text style={styles.label}>Activity level</Text>
        <ChoiceRow options={activities} value={form.activity_level} onChange={(value) => update('activity_level', value)} wrap />

        <Text style={styles.label}>Weight goal</Text>
        <ChoiceRow options={goals} value={form.weight_goal} onChange={(value) => update('weight_goal', value)} wrap />

        <Text style={styles.label}>Dietary approach</Text>
        <ChoiceRow options={approaches} value={form.approach} onChange={(value) => update('approach', value)} wrap />

        <Text style={styles.label}>Allergies to exclude</Text>
        <View style={styles.choiceRow}>
          {allergyOptions.map((item) => {
            const active = form.allergies.includes(item);
            return (
              <TouchableOpacity key={item} onPress={() => toggleAllergy(item)} style={[styles.choice, active && styles.choiceActive]}>
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Encrypted storage</Text>
        <Text style={styles.privacyText}>
          This form sends your details to the GymRatAi Supabase function. It encrypts the profile before storing it; the mobile app never receives the encryption key.
        </Text>
        <Text style={styles.pendingText}>
          MyFitnessPal requires approved partner API access before the function can send or retrieve data. Your details are saved securely while that access is pending.
        </Text>
      </View>

      <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save encrypted profile</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 22, paddingBottom: 48 },
  loading: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  backButton: { marginTop: 24, marginBottom: 26 },
  backText: { color: '#60a5fa', fontSize: 16, fontWeight: '600' },
  eyebrow: { color: COLORS.success, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginTop: 17, marginBottom: 9 },
  input: { backgroundColor: '#0f172a', borderColor: COLORS.border, borderWidth: 1, color: COLORS.text, padding: 14, borderRadius: 12, fontSize: 16 },
  measureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  measureInput: { flex: 1 },
  choiceRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  choiceWrap: { flexWrap: 'wrap' },
  choice: { backgroundColor: '#0f172a', borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4 },
  choiceActive: { backgroundColor: COLORS.accent, borderColor: '#60a5fa' },
  choiceText: { color: COLORS.muted, fontSize: 13, textTransform: 'capitalize' },
  choiceTextActive: { color: '#fff', fontWeight: '700' },
  privacyCard: { backgroundColor: '#10271f', borderColor: '#1f513e', borderWidth: 1, padding: 16, borderRadius: 16, marginTop: 18 },
  privacyTitle: { color: '#6ee7b7', fontWeight: '800', fontSize: 16, marginBottom: 7 },
  privacyText: { color: '#cbd5e1', lineHeight: 20 },
  pendingText: { color: '#fcd34d', lineHeight: 20, marginTop: 10 },
  saveButton: { backgroundColor: COLORS.accent, borderRadius: 13, alignItems: 'center', padding: 16, marginTop: 22 },
  disabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelButton: { alignItems: 'center', padding: 16, marginTop: 4 },
  cancelText: { color: COLORS.muted, fontWeight: '600' },
  muted: { color: COLORS.muted },
});
