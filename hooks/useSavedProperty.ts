import { useSupabase } from "@/hooks/useSupabase";
import { queryKeys } from "@/lib/react-query";
import { captureError, sentryBreadcrumbs } from "@/lib/sentry";
import {
  fetchSavedPropertyId,
  saveProperty,
  unsaveProperty,
} from "@/lib/services/savedProperties";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const queryClient = useQueryClient();

  const savedStatusQuery = useQuery({
    queryKey:
      userId && propertyId
        ? queryKeys.favorites.status(userId, propertyId)
        : queryKeys.favorites.status("anonymous", propertyId || "unknown"),
    queryFn: () => fetchSavedPropertyId(authSupabase, userId!, propertyId),
    enabled: Boolean(userId && propertyId),
  });

  const isSaved = Boolean(savedStatusQuery.data);

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !propertyId) return;

      if (isSaved) {
        await unsaveProperty(authSupabase, userId, propertyId);
        return "unsave" as const;
      }

      await saveProperty(authSupabase, userId, propertyId);
      return "save" as const;
    },
    onSuccess: async (action) => {
      if (!userId || !propertyId || !action) return;

      sentryBreadcrumbs.favorites(action, propertyId);

      if (action === "unsave") {
        onUnsave?.();
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.favorites.status(userId, propertyId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.favorites.list(userId),
        }),
      ]);
    },
    onError: (error) => {
      captureError(error, "toggle_saved_property", {
        propertyId,
        action: isSaved ? "unsave" : "save",
      });
    },
  });

  const toggleSave = () => {
    if (
      !userId ||
      !propertyId ||
      savedStatusQuery.isLoading ||
      toggleSaveMutation.isPending
    )
      return;
    toggleSaveMutation.mutate();
  };

  return {
    isSaved,
    saveLoading: savedStatusQuery.isLoading || toggleSaveMutation.isPending,
    toggleSave,
  };
}
