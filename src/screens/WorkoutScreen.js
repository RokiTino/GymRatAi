import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { exerciseLibrary, getRecentWorkouts, saveWorkout } from '../services/workoutService';
import { colors } from '../theme';

const makeSet = () => ({ weightKg: '', repetitions: '' });
const makeExercise = (item) => ({ key: `${Date.now()}-${Math.random()}`, name: item.name, sets: [makeSet()] });
const categories = ['All', ...new Set(exerciseLibrary.map((item) => item.category))];
const messageOf = (error) => error?.message || 'Something went wrong. Please try again.';

export default function WorkoutScreen({ navigation }) {
  const [name, setName] = useState('Workout');
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [exercises, setExercises] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await getRecentWorkouts());
      setHistoryError(false);
    } catch (error) {
      setHistoryError(true);
      if (!/workout_sessions|schema cache|does not exist/i.test(messageOf(error))) console.warn('Unable to load workouts:', error);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const filteredExercises = useMemo(() => exerciseLibrary.filter((item) =>
    (category === 'All' || item.category === category) && item.name.toLowerCase().includes(search.trim().toLowerCase())), [category, search]);
  const setCount = exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  const updateExercise = (key, transform) => setExercises((current) => current.map((item) => item.key === key ? transform(item) : item));
  const updateSet = (key, index, field, value) => updateExercise(key, (item) => ({
    ...item, sets: item.sets.map((set, i) => i === index ? { ...set, [field]: value.replace(',', '.') } : set),
  }));
  const addExercise = (item) => {
    setExercises((current) => [...current, makeExercise(item)]);
    setLibraryOpen(false);
    setSearch('');
  };
  const addSet = (key) => updateExercise(key, (item) => ({ ...item, sets: [...item.sets, makeSet()] }));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const onSave = async () => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 100) return Alert.alert('Add a workout name', 'Use between 1 and 100 characters.');
    if (!exercises.length) return Alert.alert('Add an exercise', 'Choose at least one exercise before saving.');
    const sets = [];
    for (const exercise of exercises) {
      for (let index = 0; index < exercise.sets.length; index += 1) {
        const set = exercise.sets[index];
        const weight = Number(set.weightKg);
        const reps = Number(set.repetitions);
        if (!set.weightKg.trim() || !Number.isFinite(weight) || weight < 0 || weight > 99999.99) {
          return Alert.alert('Check your weights', `Enter a valid weight for ${exercise.name}, set ${index + 1}.`);
        }
        if (!set.repetitions.trim() || !Number.isInteger(reps) || reps < 1 || reps > 1000) {
          return Alert.alert('Check your reps', `Enter a whole number from 1 to 1000 for ${exercise.name}, set ${index + 1}.`);
        }
        sets.push({ exerciseName: exercise.name, setNumber: index + 1, weightKg: weight, repetitions: reps });
      }
    }
    setSaving(true);
    try {
      await saveWorkout({ name: cleanName, startedAt, sets });
      setExercises([]);
      setName('Workout');
      setStartedAt(new Date().toISOString());
      await loadHistory();
      Alert.alert('Workout saved', 'Your session is now in workout history.');
    } catch (error) {
      Alert.alert('Could not save workout', /workout_sessions|schema cache|does not exist/i.test(messageOf(error))
        ? 'Apply the workout logging migration in Supabase, then try again.'
        : messageOf(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader navigation={navigation} title="Workout" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lime} colors={[colors.purple]} />}
      >
        <Text style={styles.eyebrow}>TRAINING LOG</Text>
        <Text style={styles.title}>Build your session</Text>
        <Text style={styles.subtitle}>Track each set and keep your progress in one place.</Text>

        <Text style={styles.label}>WORKOUT NAME</Text>
        <TextInput value={name} onChangeText={setName} maxLength={100} placeholder="e.g. Upper body" placeholderTextColor={colors.muted} style={styles.nameInput} returnKeyType="done" />

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionTitle}>This session</Text><Text style={styles.sectionMeta}>{exercises.length} exercises · {setCount} sets</Text></View>
          <TouchableOpacity style={styles.addButton} onPress={() => setLibraryOpen(true)} accessibilityRole="button"><Text style={styles.addButtonText}>＋ Add exercise</Text></TouchableOpacity>
        </View>

        {!exercises.length ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => setLibraryOpen(true)} accessibilityRole="button">
            <Text style={styles.emptyPlus}>＋</Text><Text style={styles.emptyTitle}>Start with an exercise</Text><Text style={styles.emptyText}>Browse the library and add your first movement.</Text>
          </TouchableOpacity>
        ) : exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.key} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIndex}><Text style={styles.exerciseIndexText}>{String(exerciseIndex + 1).padStart(2, '0')}</Text></View>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity onPress={() => setExercises((current) => current.filter((item) => item.key !== exercise.key))} accessibilityRole="button" accessibilityLabel={`Remove ${exercise.name}`}><Text style={styles.remove}>×</Text></TouchableOpacity>
            </View>
            <View style={styles.columnHead}><Text style={[styles.columnText, styles.setColumn]}>SET</Text><Text style={[styles.columnText, styles.weightColumn]}>WEIGHT · KG</Text><Text style={[styles.columnText, styles.repsColumn]}>REPS</Text><View style={styles.rowAction} /></View>
            {exercise.sets.map((set, index) => (
              <View key={`${exercise.key}-set-${index}`} style={styles.setRow}>
                <Text style={[styles.setNumber, styles.setColumn]}>{index + 1}</Text>
                <TextInput value={set.weightKg} onChangeText={(value) => updateSet(exercise.key, index, 'weightKg', value)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.muted} style={[styles.setInput, styles.weightColumn]} accessibilityLabel={`${exercise.name} set ${index + 1} weight in kilograms`} />
                <TextInput value={set.repetitions} onChangeText={(value) => updateSet(exercise.key, index, 'repetitions', value)} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={[styles.setInput, styles.repsColumn]} accessibilityLabel={`${exercise.name} set ${index + 1} repetitions`} />
                <TouchableOpacity style={styles.rowAction} onPress={() => updateExercise(exercise.key, (item) => ({ ...item, sets: item.sets.filter((_, i) => i !== index) }))} disabled={exercise.sets.length === 1} accessibilityRole="button" accessibilityLabel={`Remove set ${index + 1}`}><Text style={[styles.removeSet, exercise.sets.length === 1 && styles.disabled]}>−</Text></TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addSet(exercise.key)} style={styles.addSet} accessibilityRole="button"><Text style={styles.addSetText}>＋ Add set</Text></TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={[styles.saveButton, (saving || !exercises.length) && styles.saveDisabled]} onPress={onSave} disabled={saving || !exercises.length} accessibilityRole="button">
          {saving ? <ActivityIndicator color="#17151B" /> : <Text style={styles.saveText}>Save workout <Text style={styles.saveArrow}>→</Text></Text>}
        </TouchableOpacity>

        <View style={styles.historyHeading}><View><Text style={styles.sectionTitle}>Recent workouts</Text><Text style={styles.sectionMeta}>Your saved training sessions</Text></View><TouchableOpacity onPress={onRefresh} accessibilityRole="button" accessibilityLabel="Refresh workout history"><Text style={styles.refresh}>↻</Text></TouchableOpacity></View>
        {historyError ? <View style={styles.historyEmpty}><Text style={styles.historyEmptyText}>Workout history is unavailable. Check your Supabase connection and migration.</Text></View> : history.length === 0 ? (
          <View style={styles.historyEmpty}><Text style={styles.historyEmptyTitle}>No workouts yet</Text><Text style={styles.historyEmptyText}>Saved sessions will appear here.</Text></View>
        ) : history.map((workout) => {
          const entries = workout.workout_sets || [];
          const exerciseNames = [...new Set(entries.map((set) => set.exercise_name))];
          return <View key={workout.id} style={styles.historyCard}>
            <View style={styles.historyTop}><Text style={styles.historyName}>{workout.name}</Text><Text style={styles.historyDate}>{formatDate(workout.completed_at)}</Text></View>
            <Text style={styles.historyDetail}>{exerciseNames.length} exercises · {entries.length} sets</Text>
            <Text style={styles.historyExercises} numberOfLines={2}>{exerciseNames.join('  ·  ')}</Text>
          </View>;
        })}
      </ScrollView>

      <Modal visible={libraryOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLibraryOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}><View><Text style={styles.eyebrow}>MOVEMENT LIBRARY</Text><Text style={styles.modalTitle}>Add an exercise</Text></View><TouchableOpacity style={styles.closeButton} onPress={() => setLibraryOpen(false)} accessibilityRole="button" accessibilityLabel="Close exercise library"><Text style={styles.closeText}>×</Text></TouchableOpacity></View>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search exercises" placeholderTextColor={colors.muted} style={styles.searchInput} returnKeyType="search" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller} contentContainerStyle={styles.categories} keyboardShouldPersistTaps="handled">
            {categories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categorySelected]}><Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text></TouchableOpacity>)}
          </ScrollView>
          <ScrollView style={styles.libraryList} keyboardShouldPersistTaps="handled">
            {filteredExercises.map((item) => <TouchableOpacity key={item.name} style={styles.libraryItem} onPress={() => addExercise(item)} accessibilityRole="button"><View><Text style={styles.libraryName}>{item.name}</Text><Text style={styles.libraryCategory}>{item.category}</Text></View><Text style={styles.libraryPlus}>＋</Text></TouchableOpacity>)}
            {!filteredExercises.length && <Text style={styles.noResults}>No matching exercises.</Text>}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 22, paddingTop: 8 },
  content: { paddingBottom: 34 },
  eyebrow: { color: colors.lime, fontSize: 10, letterSpacing: 1.6, fontWeight: '800', marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 23 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 },
  nameInput: { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, height: 50, fontSize: 15, marginBottom: 25 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  addButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceRaised },
  addButtonText: { color: colors.lime, fontSize: 12, fontWeight: '800' },
  emptyCard: { minHeight: 164, borderRadius: 20, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 20 },
  emptyPlus: { color: colors.purple, fontSize: 28, marginBottom: 8 }, emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '800' }, emptyText: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 6 },
  exerciseCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, exerciseIndex: { height: 30, width: 30, borderRadius: 10, backgroundColor: '#403953', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, exerciseIndexText: { color: colors.purple, fontSize: 10, fontWeight: '900' },
  exerciseName: { color: colors.text, flex: 1, fontSize: 14, fontWeight: '800' }, remove: { color: colors.muted, fontSize: 26, paddingHorizontal: 5 },
  columnHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 }, columnText: { color: colors.muted, fontSize: 9, fontWeight: '800', textAlign: 'center', letterSpacing: 0.6 }, setColumn: { width: '15%' }, weightColumn: { width: '37%' }, repsColumn: { width: '31%' }, rowAction: { width: '17%', alignItems: 'center', justifyContent: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 }, setNumber: { color: colors.muted, fontSize: 13, textAlign: 'center' }, setInput: { height: 39, backgroundColor: colors.surfaceRaised, borderRadius: 10, marginHorizontal: 2, textAlign: 'center', color: colors.text, fontSize: 14, paddingVertical: 0, paddingHorizontal: 4 }, removeSet: { color: colors.danger, fontSize: 22 }, disabled: { opacity: 0.25 },
  addSet: { alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 5 }, addSetText: { color: colors.purple, fontSize: 12, fontWeight: '800' },
  saveButton: { minHeight: 54, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 29 }, saveDisabled: { opacity: 0.45 }, saveText: { color: '#17151B', fontSize: 15, fontWeight: '900' }, saveArrow: { fontSize: 19 },
  historyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }, refresh: { color: colors.purple, fontSize: 24, padding: 4 }, historyEmpty: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 18, backgroundColor: colors.surface }, historyEmptyTitle: { color: colors.text, fontWeight: '800', fontSize: 14 }, historyEmptyText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  historyCard: { padding: 15, backgroundColor: colors.surface, borderRadius: 16, borderColor: colors.border, borderWidth: 1, marginBottom: 9 }, historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, historyName: { color: colors.text, fontWeight: '800', fontSize: 14, flex: 1 }, historyDate: { color: colors.muted, fontSize: 11 }, historyDetail: { color: colors.lime, fontSize: 11, marginTop: 7, fontWeight: '700' }, historyExercises: { color: colors.muted, fontSize: 11, marginTop: 5 },
  modal: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 20 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, modalTitle: { color: colors.text, fontSize: 24, fontWeight: '900' }, closeButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }, closeText: { color: colors.text, fontSize: 26, lineHeight: 28 }, searchInput: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, height: 48, borderRadius: 14, paddingHorizontal: 14, color: colors.text, marginBottom: 14 }, categoryScroller: { flexGrow: 0, marginBottom: 10 }, categories: { gap: 8, paddingVertical: 2 }, categoryChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 30, backgroundColor: colors.surfaceRaised }, categorySelected: { backgroundColor: colors.purple }, categoryText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, categoryTextSelected: { color: '#17151B' }, libraryList: { flex: 1 }, libraryItem: { minHeight: 64, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }, libraryName: { color: colors.text, fontSize: 14, fontWeight: '700' }, libraryCategory: { color: colors.muted, fontSize: 11, marginTop: 4 }, libraryPlus: { color: colors.lime, fontSize: 21, padding: 7 }, noResults: { color: colors.muted, textAlign: 'center', padding: 24 },
});
