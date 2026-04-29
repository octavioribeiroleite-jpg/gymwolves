import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── List groups the user belongs to (active by default) ──
export const useUserGroups = (groupStatus: "active" | "finished" | "all" = "active") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-groups", user?.id, groupStatus],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships, error: mErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (mErr) throw mErr;
      if (!memberships.length) return [];

      const ids = memberships.map((m) => m.group_id);
      const baseQuery: any = supabase
        .from("groups")
        .select("*")
        .in("id", ids);
      const filtered = groupStatus === "all"
        ? baseQuery
        : baseQuery.eq("status", groupStatus);
      const { data, error } = await filtered.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// ── Completed groups (status = 'finished') ──
export const useCompletedGroups = () => useUserGroups("finished");

// ── Single group detail ──
export const useGroupDetail = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["group-detail", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
};

// ── Group members with profiles ──
export const useGroupMembers = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("group_members")
        .select("*, profiles:user_id(id, display_name, avatar_url)")
        .eq("group_id", groupId)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
};

// ── Create group ──
export const useCreateGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      type: string;
      startDate?: string;
      endDate?: string;
      goalTotal: number;
      bannerUrl?: string;
    }) => {
      if (!user) throw new Error("Não autenticado");
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          name: params.name,
          created_by: user.id,
          ...(params.type === "challenge" && params.startDate
            ? { start_date: params.startDate, end_date: params.endDate } as any
            : {}),
          type: params.type,
          goal_total: params.goalTotal,
          scoring_mode: "days_active",
          ...(params.bannerUrl ? { banner_url: params.bannerUrl } as any : {}),
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Creator becomes admin member
      const { error: mErr } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: "active",
          role: "admin",
        } as any);
      if (mErr) throw mErr;

      return group;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("Grupo criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Join group by invite code ──
export const useJoinGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Não autenticado");
      const { data: groups, error: fErr } = await supabase
        .rpc("find_group_by_invite_code", { _code: code });
      if (fErr) throw fErr;
      if (!groups || groups.length === 0) throw new Error("Código inválido");

      const group = groups[0];
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: group.id, user_id: user.id, status: "active" });
      if (error) {
        if (error.code === "23505") throw new Error("Você já está neste grupo");
        throw error;
      }
      return group;
    },
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success(`Você entrou no grupo "${g.name}"!`);
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Update group (admin only) ──
export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, updates }: {
      groupId: string;
      updates: {
        name?: string;
        goal_total?: number;
        start_date?: string | null;
        end_date?: string | null;
        scoring_mode?: string;
      };
    }) => {
      const { error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      qc.invalidateQueries({ queryKey: ["group-detail", groupId] });
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("Grupo atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Remove member (admin only) ──
export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, groupId }: { memberId: string; groupId: string }) => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      qc.invalidateQueries({ queryKey: ["group-members", groupId] });
      toast.success("Membro removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

// ── Leave group ──
export const useLeaveGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("Você saiu do grupo");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
