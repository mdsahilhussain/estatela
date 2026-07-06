import { useSupabase } from "@/hooks/useSupabase";
import { captureError, sentryBreadcrumbs } from "@/lib/sentry";
import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [propertyId, userId]);

  const checkIfSaved = async () => {
    if (!userId) return;
    try {
      const { data, error } = await authSupabase
        .from("saved_properties")
        .select("id")
        .eq("user_clerk_id", userId)
        .eq("property_id", propertyId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setIsSaved(!!data);
    } catch (error) {
      captureError(error, "check_saved_property", { propertyId });
    }
  };

  const toggleSave = async () => {
    if (!userId || saveLoading) return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        const { error } = await authSupabase
          .from("saved_properties")
          .delete()
          .eq("user_clerk_id", userId)
          .eq("property_id", propertyId);

        if (error) throw error;

        sentryBreadcrumbs.favorites("unsave", propertyId);
        setIsSaved(false);
        onUnsave?.();
      } else {
        const { error } = await authSupabase
          .from("saved_properties")
          .insert({ user_clerk_id: userId, property_id: propertyId });

        if (error) throw error;

        sentryBreadcrumbs.favorites("save", propertyId);
        setIsSaved(true);
      }
    } catch (error) {
      captureError(error, "toggle_saved_property", {
        propertyId,
        action: isSaved ? "unsave" : "save",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return { isSaved, saveLoading, toggleSave };
}
