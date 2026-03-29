import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups } from "@/hooks/useGroupData";
import { toast } from "sonner";

const WORKOUT_EMOJIS: Record<string, string> = {
  musculacao: "🏋️",
  corrida: "🏃",
  crossfit: "💪",
  natacao: "🏊",
  ciclismo: "🚴",
  yoga: "🧘",
  luta: "🥊",
  caminhada: "🚶",
  aerobio: "🫀",
  outro: "⚡",
};

export const useCheckinNotifications = () => {
  const { user } = useAuth();
  const { data: groups } = useUserGroups();
  const groupIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    groupIdsRef.current = new Set(groups?.map((g: any) => g.id) || []);
  }, [groups]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("checkin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkins" },
        async (payload) => {
          const newCheckin = payload.new as any;

          // Skip own checkins
          if (newCheckin.user_id === user.id) return;

          // Skip if not in user's groups
          if (!groupIdsRef.current.has(newCheckin.group_id)) return;

          // Fetch profile name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", newCheckin.user_id)
            .single();

          const name = profile?.display_name || "Alguém";
          const emoji = WORKOUT_EMOJIS[newCheckin.workout_type] || "⚡";

          toast(`${emoji} ${name} acabou de treinar!`, {
            description: newCheckin.title || "Check-in registrado",
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
