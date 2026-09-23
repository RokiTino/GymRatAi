import { supabase } from './supabaseClient';

export async function loadNutritionProfile() {
  const { data, error } = await supabase.functions.invoke('nutrition-profile', {
    body: { action: 'load' },
  });
  if (error) throw error;
  return data;
}

export async function saveNutritionProfile(profile) {
  const { data, error } = await supabase.functions.invoke('nutrition-profile', {
    body: { action: 'save', profile },
  });
  if (error) throw error;
  return data;
}
