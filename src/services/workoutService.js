import { supabase } from './supabaseClient';

export const exerciseLibrary = [
  { name: 'Barbell bench press', category: 'Chest' },
  { name: 'Dumbbell bench press', category: 'Chest' },
  { name: 'Incline dumbbell press', category: 'Chest' },
  { name: 'Push-up', category: 'Chest' },
  { name: 'Lat pulldown', category: 'Back' },
  { name: 'Seated cable row', category: 'Back' },
  { name: 'Barbell row', category: 'Back' },
  { name: 'Pull-up', category: 'Back' },
  { name: 'Overhead press', category: 'Shoulders' },
  { name: 'Dumbbell lateral raise', category: 'Shoulders' },
  { name: 'Face pull', category: 'Shoulders' },
  { name: 'Dumbbell curl', category: 'Arms' },
  { name: 'Triceps pushdown', category: 'Arms' },
  { name: 'Barbell squat', category: 'Legs' },
  { name: 'Leg press', category: 'Legs' },
  { name: 'Romanian deadlift', category: 'Legs' },
  { name: 'Leg curl', category: 'Legs' },
  { name: 'Standing calf raise', category: 'Legs' },
  { name: 'Plank', category: 'Core' },
  { name: 'Hanging knee raise', category: 'Core' },
];

export async function getRecentWorkouts(limit = 10) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, name, started_at, completed_at, workout_sets(id, exercise_name, set_number, weight_kg, repetitions)')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function saveWorkout({ name, startedAt, sets }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.rpc('save_workout', {
    p_name: name,
    p_started_at: startedAt,
    p_sets: sets.map((set) => ({
      exercise_name: set.exerciseName,
      set_number: set.setNumber,
      weight_kg: Number(set.weightKg),
      repetitions: Number.parseInt(set.repetitions, 10),
    })),
  });

  if (error) throw error;
  return data;
}
