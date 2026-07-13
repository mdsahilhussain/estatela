import { captureError } from "@/lib/sentry";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSavedPropertyId(
  authSupabase: SupabaseClient,
  userId: string,
  propertyId: string
): Promise<string | null> {
  try {
    const { data, error } = await authSupabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data?.id ?? null;
  } catch (error) {
    captureError(error, "check_saved_property", { propertyId });
    throw error;
  }
}

export async function saveProperty(
  authSupabase: SupabaseClient,
  userId: string,
  propertyId: string
) {
  const { error } = await authSupabase
    .from("saved_properties")
    .insert({ user_clerk_id: userId, property_id: propertyId });

  if (error) throw error;
}

export async function unsaveProperty(
  authSupabase: SupabaseClient,
  userId: string,
  propertyId: string
) {
  const { error } = await authSupabase
    .from("saved_properties")
    .delete()
    .eq("user_clerk_id", userId)
    .eq("property_id", propertyId);

  if (error) throw error;
}
