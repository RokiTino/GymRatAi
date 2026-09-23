import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors } from '../theme';

export default function PlanGenScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title="AI plan" />
      <View style={styles.heroIcon}><Text style={styles.sparkle}>✦</Text></View>
      <Text style={styles.eyebrow}>YOUR NEXT LEVEL</Text>
      <Text style={styles.title}>A plan built{`\n`}around you.</Text>
      <Text style={styles.subtitle}>
        Workout-plan generation is being connected. Your training goal and experience will guide your program.
      </Text>

      <TouchableOpacity style={styles.nutritionCard} onPress={() => navigation.navigate('NutritionProfile')}>
        <View style={styles.nutritionGlyph}><Text style={styles.nutritionGlyphText}>◎</Text></View>
        <View style={styles.nutritionCopy}>
          <Text style={styles.cardTitle}>Add nutrition goals</Text>
          <Text style={styles.cardSubtitle}>Use your preferences as extra plan context</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>MyFitnessPal connection</Text>
        <Text style={styles.infoText}>
          MyFitnessPal can provide nutrition targets and recipes to complement a workout plan. It does not generate workout routines, and direct app access is waiting on partner API approval.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => Alert.alert('Coming soon', 'AI workout-plan generation is not connected yet.')}
      >
        <Text style={styles.buttonText}>AI plan coming soon</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 22, paddingTop: 20 },
  heroIcon: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple, marginTop: 8, marginBottom: 22 },
  sparkle: { color: colors.lime, fontSize: 34, fontWeight: '800' },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 11, marginBottom: 22 },
  nutritionCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19 },
  nutritionGlyph: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#343044', alignItems: 'center', justifyContent: 'center' },
  nutritionGlyphText: { color: colors.lime, fontSize: 25, fontWeight: '800' },
  nutritionCopy: { flex: 1, marginLeft: 12 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  cardSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  chevron: { color: colors.lime, fontSize: 24, marginLeft: 8 },
  infoCard: { backgroundColor: '#211E2C', borderColor: '#393246', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 14 },
  infoTitle: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 6 },
  infoText: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  primaryButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple, marginTop: 20 },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 14 },
});
