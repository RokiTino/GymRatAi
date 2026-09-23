import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadNutritionProfile, saveNutritionProfile } from '../services/nutritionService';
import AppHeader from '../components/AppHeader';
import { colors } from '../theme';

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
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    try {
      const result = await saveNutritionProfile({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
      setSaved(true);
      if (result.integration !== 'awaiting_myfitnesspal_partner_access') {
        Alert.alert('Saved securely', 'Your nutrition profile was saved.');
      }
    } catch (error) {
      Alert.alert('Could not save', error?.message || 'Sign in and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator color={colors.lime} />
        <Text style={styles.muted}>Loading your encrypted nutrition profile…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppHeader navigation={navigation} title="Nutrition profile" />
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
          placeholderTextColor={colors.muted}
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
            placeholderTextColor={colors.muted}
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
            placeholderTextColor={colors.muted}
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
        <Text style={styles.allergyHint}>Swipe to see every option</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          persistentScrollbar
          contentContainerStyle={styles.allergyChoices}
          keyboardShouldPersistTaps="handled"
        >
          {allergyOptions.map((item) => {
            const active = form.allergies.includes(item);
            return (
              <TouchableOpacity key={item} onPress={() => toggleAllergy(item)} style={[styles.choice, active && styles.choiceActive]} accessibilityRole="checkbox" accessibilityState={{ checked: active }}>
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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

      {saved ? (
        <View style={styles.successCard} accessibilityLiveRegion="polite">
          <Text style={styles.successIcon}>✓</Text>
          <View style={styles.successCopy}>
            <Text style={styles.successTitle}>Profile saved securely</Text>
            <Text style={styles.successText}>Your encrypted nutrition profile is stored in Supabase. MyFitnessPal sync will be available after partner approval.</Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#17151B" /> : <Text style={styles.saveText}>{saved ? 'Save changes' : 'Save nutrition profile'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 48 },
  loading: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  card: { backgroundColor: colors.surface, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 17, marginBottom: 9 },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, color: colors.text, padding: 14, borderRadius: 13, fontSize: 15 },
  measureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  measureInput: { flex: 1 },
  choiceRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  choiceWrap: { flexWrap: 'wrap' },
  allergyHint: { color: colors.muted, fontSize: 10, marginTop: -2, marginBottom: 7 },
  allergyChoices: { gap: 8, paddingBottom: 11, paddingRight: 16 },
  choice: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, marginBottom: 2 },
  choiceActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  choiceText: { color: colors.muted, fontSize: 12, textTransform: 'capitalize' },
  choiceTextActive: { color: colors.text, fontWeight: '800' },
  privacyCard: { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 18, marginTop: 18 },
  privacyTitle: { color: colors.lime, fontWeight: '800', fontSize: 14, marginBottom: 7 },
  privacyText: { color: colors.text, fontSize: 12, lineHeight: 18 },
  pendingText: { color: colors.lime, fontSize: 11, lineHeight: 17, marginTop: 10 },
  successCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#253322', borderColor: '#536840', borderWidth: 1, padding: 14, borderRadius: 17, marginTop: 16 },
  successIcon: { color: colors.lime, fontSize: 16, fontWeight: '900' },
  successCopy: { flex: 1 },
  successTitle: { color: colors.lime, fontWeight: '800', fontSize: 13 },
  successText: { color: colors.text, fontSize: 11, lineHeight: 16, marginTop: 4 },
  saveButton: { backgroundColor: colors.lime, borderRadius: 15, alignItems: 'center', justifyContent: 'center', minHeight: 54, paddingHorizontal: 16, marginTop: 18 },
  disabled: { opacity: 0.6 },
  saveText: { color: '#17151B', fontSize: 14, fontWeight: '900' },
  cancelButton: { alignItems: 'center', padding: 16, marginTop: 4 },
  cancelText: { color: colors.muted, fontWeight: '700' },
  muted: { color: colors.muted },
});
