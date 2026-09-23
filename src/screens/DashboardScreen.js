import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function DashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.eyebrow}>GYMRATAI</Text>
      <Text style={styles.title}>My Training</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Current Plan</Text>
        <Text style={styles.cardValue}>No active plan</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PlanGen')}
        >
          <Text style={styles.buttonText}>Generate AI Plan</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Workout')}
      >
        <View>
          <Text style={styles.actionTitle}>Start Empty Workout</Text>
          <Text style={styles.actionSubtitle}>Log sets manually</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('NutritionProfile')}
      >
        <View>
          <Text style={styles.actionTitle}>Nutrition profile</Text>
          <Text style={styles.actionSubtitle}>Set goals and dietary preferences</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  eyebrow: { color: '#34d399', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginTop: 40 },
  title: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 24, marginTop: 8 },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: '#334155' },
  cardLabel: { color: '#94a3b8', marginBottom: 4 },
  cardValue: { color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  primaryButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '500' },
  actionCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  actionTitle: { color: 'white', fontSize: 17, fontWeight: '600' },
  actionSubtitle: { color: '#94a3b8', marginTop: 4 },
  arrow: { color: '#3b82f6', fontSize: 24 },
});
