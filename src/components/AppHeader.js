import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export default function AppHeader({ navigation, title, fallbackRoute = 'Dashboard' }) {
  function goBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace(fallbackRoute);
    }
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Go back from ${title}`}
        onPress={goBack}
        style={styles.backButton}
        hitSlop={10}
      >
        <Text style={styles.backGlyph}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 18 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  backGlyph: { color: colors.text, fontSize: 31, lineHeight: 34, marginTop: -3 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginLeft: 13 },
  spacer: { flex: 1 },
});
