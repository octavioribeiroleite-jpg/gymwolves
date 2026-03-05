import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useUserGroups = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-groups", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships, error: mError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (mError) throw mError;
      if (!memberships.length) return [];

      const groupIds = memberships.map((m) => m.group_id);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

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

export const useCreateGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("groups")
        .insert({ name, created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      // Add creator as member
      await supabase
        .from("group_members")
        .insert({ group_id: data.id, user_id: user.id, status: "active" });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("Grupo criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useJoinGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error("Não autenticado");

      const { data: groups, error: gError } = await supabase
        .rpc("find_group_by_invite_code", { _code: inviteCode });
      if (gError) throw gError;
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
