import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WorkoutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Workout</Text>
      <View style={styles.setCard}>
        <Text style={styles.exerciseName}>Bench Press</Text>
        <Text style={styles.setDetail}>Set 1: 100kg x 8</Text>
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 24, marginTop: 40 },
  setCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 },
  exerciseName: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  setDetail: { color: '#94a3b8' },
  primaryButton: { backgroundColor: '#2563eb', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
});
