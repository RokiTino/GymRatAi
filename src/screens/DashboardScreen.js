import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../services/auth';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme';

const tabs = [
  { label: 'Home', glyph: '⌂', route: 'Dashboard' },
  { label: 'Workout', glyph: '◉', route: 'Workout' },
  { label: 'AI Plan', glyph: '✦', route: 'PlanGen' },
  { label: 'Nutrition', glyph: '◌', route: 'NutritionProfile' },
];

export default function DashboardScreen({ navigation, route }) {
  const { profile, setProfile } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(route.params?.notice || '');

  useEffect(() => {
    if (route.params?.notice) {
      setNotice(route.params.notice);
      navigation.setParams({ notice: undefined });
    }
  }, [navigation, route.params?.notice]);

  const refreshProfile = useCallback(async () => {
    const user = await authService.getCurrentUser();
    if (!user) return;
    const currentProfile = await authService.getProfile(user.id);
    if (currentProfile) setProfile(currentProfile);
  }, [setProfile]);

  useEffect(() => {
    refreshProfile().catch((error) => console.warn('Dashboard profile refresh failed', error?.message));
  }, [refreshProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      Alert.alert('Refresh failed', error?.message || 'Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const firstName = profile?.full_name?.trim()?.split(/\s+/)[0];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lime}
            colors={[colors.purple]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={styles.topLine}>
          <View>
            <Text style={styles.brand}><Text style={styles.brandAccent}>GYM</Text>RATAI</Text>
            <Text style={styles.overline}>YOUR TRAINING SPACE</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open training profile"
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{firstName?.[0]?.toUpperCase() || 'G'}</Text>
          </TouchableOpacity>
        </View>

        {notice ? (
          <TouchableOpacity style={styles.notice} onPress={() => setNotice('')} accessibilityRole="button">
            <Text style={styles.noticeGlyph}>✓</Text>
            <Text style={styles.noticeText}>{notice}</Text>
            <Text style={styles.dismiss}>×</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.greeting}>{firstName ? `Hey, ${firstName}` : 'Ready to train?'}</Text>
        <Text style={styles.subtitle}>Small steps. Stronger every session.</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroEyebrow}>YOUR NEXT SESSION</Text>
          <Text style={styles.heroTitle}>Build a plan{`\n`}that moves you.</Text>
          <Text style={styles.heroCopy}>Personalized around your goals, experience, and schedule.</Text>
          <TouchableOpacity style={styles.limeButton} onPress={() => navigation.navigate('PlanGen')}>
            <Text style={styles.limeButtonText}>Generate AI plan</Text>
            <Text style={styles.limeArrow}>↗</Text>
          </TouchableOpacity>
          <Text style={styles.heroMark}>GR</Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionCaption}>MAKE IT COUNT</Text>
        </View>

        <TouchableOpacity style={styles.workoutCard} onPress={() => navigation.navigate('Workout')}>
          <View style={styles.workoutIcon}><Text style={styles.workoutIconText}>＋</Text></View>
          <View style={styles.workoutCopy}>
            <Text style={styles.cardTitle}>Start a workout</Text>
            <Text style={styles.cardSub}>Log your sets and track your progress</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your setup</Text>
        </View>
        <TouchableOpacity style={styles.nutritionCard} onPress={() => navigation.navigate('NutritionProfile')}>
          <View style={styles.nutritionIcon}><Text style={styles.nutritionIconText}>✦</Text></View>
          <View style={styles.workoutCopy}>
            <Text style={styles.cardTitle}>Nutrition profile</Text>
            <Text style={styles.cardSub}>Goals, preferences, and allergies</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.pullHint}>Pull down to refresh your profile</Text>
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const selected = tab.route === 'Dashboard';
          return (
            <TouchableOpacity
              key={tab.route}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => tab.route !== 'Dashboard' && navigation.navigate(tab.route)}
              style={styles.tab}
            >
              <Text style={[styles.tabGlyph, selected && styles.tabSelected]}>{tab.glyph}</Text>
              <Text style={[styles.tabLabel, selected && styles.tabSelected]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 28 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brand: { color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 1.2 },
  brandAccent: { color: colors.lime },
  overline: { color: colors.muted, fontSize: 9, letterSpacing: 1.6, fontWeight: '700', marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontSize: 17, fontWeight: '800' },
  greeting: { color: colors.text, fontSize: 29, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 6, marginBottom: 22 },
  heroCard: { position: 'relative', overflow: 'hidden', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 28, padding: 22, minHeight: 280, marginBottom: 28 },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -75, top: -50, backgroundColor: colors.purple, opacity: 0.22 },
  heroEyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  heroTitle: { color: colors.text, fontSize: 31, lineHeight: 37, fontWeight: '900', marginTop: 18, maxWidth: 290 },
  heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 10, maxWidth: 260 },
  limeButton: { minHeight: 48, marginTop: 20, paddingHorizontal: 16, borderRadius: 15, backgroundColor: colors.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'flex-start', minWidth: 190 },
  limeButtonText: { color: '#16151A', fontSize: 14, fontWeight: '900' },
  limeArrow: { color: '#16151A', fontSize: 19, fontWeight: '800' },
  heroMark: { position: 'absolute', right: 17, bottom: 2, color: colors.text, fontSize: 68, fontWeight: '900', opacity: 0.05 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionCaption: { color: colors.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: '800' },
  workoutCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 24 },
  workoutIcon: { height: 46, width: 46, borderRadius: 15, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  workoutIconText: { color: colors.text, fontSize: 27, lineHeight: 30 },
  workoutCopy: { flex: 1, marginLeft: 13 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardSub: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  chevron: { color: colors.lime, fontSize: 25, marginLeft: 8 },
  nutritionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  nutritionIcon: { height: 46, width: 46, borderRadius: 15, backgroundColor: '#353044', alignItems: 'center', justifyContent: 'center' },
  nutritionIconText: { color: colors.lime, fontSize: 22 },
  pullHint: { color: colors.muted, textAlign: 'center', fontSize: 10, marginTop: 18 },
  notice: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 14, backgroundColor: '#293323', borderWidth: 1, borderColor: '#4D6436', marginBottom: 20 },
  noticeGlyph: { color: colors.lime, fontSize: 16, fontWeight: '900', marginRight: 9 },
  noticeText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 17 },
  dismiss: { color: colors.muted, fontSize: 20, paddingLeft: 10 },
  tabBar: { height: 72, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { minWidth: 62, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabGlyph: { color: colors.muted, fontSize: 20, fontWeight: '700' },
  tabLabel: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  tabSelected: { color: colors.lime },
});
