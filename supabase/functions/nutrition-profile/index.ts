import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const goals = new Set(["lose", "maintain", "gain"]);
const activities = new Set([
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extremely_active",
]);
const approaches = new Set([
  "omni", "carb", "keto", "pesc", "flex", "veg", "vegan",
  "paleo", "clean", "mediterranean", "highProtein",
]);

function validateProfile(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid profile");
  const p = value as Record<string, unknown>;
  const age = Number(p.age);
  const height = Number(p.height);
  const weight = Number(p.weight);
  const sex = p.sex;
  const heightUnit = p.height_unit;
  const weightUnit = p.weight_unit;
  const activity = p.activity_level;
  const goal = p.weight_goal;
  const approach = p.approach ?? "omni";
  const allergies = p.allergies ?? [];

  if (!Number.isInteger(age) || age < 18 || age > 100) throw new Error("Age must be between 18 and 100");
  if (sex !== "male" && sex !== "female") throw new Error("Select a supported sex value");
  if (!Number.isFinite(height) || height <= 0 || !["cm", "inches"].includes(String(heightUnit))) throw new Error("Enter a valid height");
  if (!Number.isFinite(weight) || weight <= 0 || !["kg", "lb"].includes(String(weightUnit))) throw new Error("Enter a valid weight");
  if (!activities.has(String(activity))) throw new Error("Select an activity level");
  if (!goals.has(String(goal))) throw new Error("Select a weight goal");
  if (!approaches.has(String(approach))) throw new Error("Select a dietary approach");
  if (!Array.isArray(allergies) || allergies.some((item) => typeof item !== "string" || item.length > 40)) {
    throw new Error("Invalid allergy list");
  }

  return {
    age,
    sex,
    height,
    height_unit: heightUnit,
    weight,
    weight_unit: weightUnit,
    activity_level: activity,
    weight_goal: goal,
    approach,
    allergies: [...new Set(allergies)].slice(0, 12),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\\s+/i, "");
  if (!token) return json({ error: "Sign in to continue" }, 401);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const publishableKey = publishableKeys.default ?? Deno.env.get("SUPABASE_ANON_KEY");
    const secretKey = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !publishableKey || !secretKey) {
      return json({ error: "Nutrition service is not configured" }, 503);
    }

    const userClient = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Your session is invalid or expired. Sign in again." }, 401);

    const adminClient = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const body = await req.json();
    if (body?.action === "load") {
      const { data, error } = await adminClient.rpc("get_nutrition_profile", { p_user_id: user.id });
      if (error) {
        console.error("nutrition profile load failed", error.code);
        return json({ error: "Could not load your nutrition profile" }, 500);
      }
      return json({ profile: data ?? null, integration: "awaiting_myfitnesspal_partner_access" });
    }

    if (body?.action !== "save") return json({ error: "Unsupported action" }, 400);
    let profile;
    try {
      profile = validateProfile(body.profile);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid profile" }, 422);
    }

    const { error } = await adminClient.rpc("save_nutrition_profile", {
      p_user_id: user.id,
      p_payload: profile,
    });
    if (error) {
      console.error("nutrition profile save failed", error.code);
      return json({ error: "Could not securely save your nutrition profile" }, 500);
    }

    // MyFitnessPal's app-facing API is private. Do not send data until approved
    // partner access and server-side credentials have been configured.
    return json({ saved: true, integration: "awaiting_myfitnesspal_partner_access" });
  } catch (error) {
    console.error("nutrition profile request failed", error instanceof Error ? error.name : "unknown");
    return json({ error: "Unexpected nutrition service error" }, 500);
  }
});