import { captureError } from "@/lib/sentry";
import { supabase } from "@/lib/supabase";

export type HomeProperties = {
  featured: Property[];
  recommended: Property[];
};

export async function fetchHomeProperties(): Promise<HomeProperties> {
  try {
    const [
      { data: featuredData, error: featuredError },
      { data: recommendedData, error: recommendedError },
    ] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false }),

      supabase
        .from("properties")
        .select("*")
        .eq("is_featured", false)
        .order("created_at", { ascending: false }),
    ]);

    if (featuredError) throw featuredError;
    if (recommendedError) throw recommendedError;

    return {
      featured: (featuredData as Property[] | null) ?? [],
      recommended: (recommendedData as Property[] | null) ?? [],
    };
  } catch (error) {
    captureError(error, "fetch_home_properties");
    throw error;
  }
}
