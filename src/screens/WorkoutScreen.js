import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors } from '../theme';

export default function WorkoutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} title="Workout" />
      <Text style={styles.eyebrow}>TRAINING</Text>
      <Text style={styles.title}>Active workout</Text>
      <Text style={styles.subtitle}>Your session is ready when you are.</Text>
      <View style={styles.setCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.number}>01</Text>
          <Text style={styles.exerciseName}>Bench press</Text>
          <Text style={styles.more}>•••</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.setDetail}>Set 1</Text>
        <Text style={styles.value}>100 <Text style={styles.unit}>kg</Text><Text style={styles.multiply}>  ×  </Text>8 <Text style={styles.unit}>reps</Text></Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Dashboard')}>
        <Text style={styles.buttonText}>Finish workout</Text>
        <Text style={styles.buttonArrow}>✓</Text>
      </TouchableOpacity>
      <Text style={styles.note}>Workout logging is still being built. This preview session is not saved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 22, paddingTop: 20 },
  eyebrow: { color: colors.lime, fontSize: 10, letterSpacing: 1.6, fontWeight: '800', marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 7, marginBottom: 23 },
  setCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  number: { color: colors.purple, fontSize: 12, fontWeight: '900', marginRight: 12 },
  exerciseName: { color: colors.text, flex: 1, fontSize: 17, fontWeight: '800' },
  more: { color: colors.muted, letterSpacing: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  setDetail: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  value: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 6 },
  unit: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  multiply: { color: colors.purple, fontSize: 20 },
  primaryButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 11, minHeight: 54, backgroundColor: colors.lime, borderRadius: 16, marginTop: 22 },
  buttonText: { color: '#17151B', fontSize: 15, fontWeight: '900' },
  buttonArrow: { color: '#17151B', fontSize: 18, fontWeight: '900' },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 12, textAlign: 'center' },
});
