import { captureError, clearSentryUser, setSentryUser } from "@/lib/sentry";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);

  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) {
      clearSentryUser();
      setIsAdmin(false);
      return;
    }

    setSentryUser({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });

    syncUser();
  }, [user]);

  const syncUser = async () => {
    try {
      const { data, error } = await authSupabase
        .from("users")
        .select("clerk_id, is_admin")
        .eq("clerk_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        // user exists - just sync isAdmin to zustand
        setIsAdmin(data.is_admin ?? false);
        return;
      }

      const { data: newUser, error: insertError } = await authSupabase
        .from("users")
        .insert({
          clerk_id: user!.id,
          email: user!.emailAddresses[0]?.emailAddress,
          first_name: user!.firstName,
          last_name: user!.lastName,
          avatar_url: user!.imageUrl,
        })
        .select("is_admin")
        .single();

      if (insertError) throw insertError;

      setIsAdmin(newUser?.is_admin ?? false);
    } catch (error) {
      captureError(error, "sync_clerk_user_to_supabase", {
        clerkUserId: user?.id,
      });
    }
  };
};
