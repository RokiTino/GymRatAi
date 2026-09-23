import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PlanGenScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Plan Generator</Text>
      <Text style={styles.subtitle}>
        Claude will now design a professional program based on your profile.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Generate Plan (Mock)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  primaryButton: { backgroundColor: '#2563eb', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
});
