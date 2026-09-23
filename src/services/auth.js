import { supabase } from './supabaseClient';

export const authService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: profile.user_id,
        goal: profile.goal,
        experience_level: profile.experience_level,
        equipment_available: profile.equipment_available,
        training_days_per_week: profile.training_days_per_week,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  }
};
