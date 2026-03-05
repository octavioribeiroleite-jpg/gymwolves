import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useGroupDetail, useLeaveGroup } from "@/hooks/useGroupData";
import { useGroupCheckins, hasCheckedInToday } from "@/hooks/useCheckins";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Plus, LayoutDashboard, Newspaper, MessageSquare } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import CheckinDialog from "@/components/CheckinDialog";
import ChallengeGeneralTab from "@/components/challenge/ChallengeGeneralTab";
import ChallengeFeedTab from "@/components/challenge/ChallengeFeedTab";
import ChallengeChatTab from "@/components/challenge/ChallengeChatTab";

type TabKey = "geral" | "feed" | "chat";

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "geral", label: "Geral", icon: LayoutDashboard },
  { key: "feed", label: "Feed", icon: Newspaper },
  { key: "chat", label: "Chat", icon: MessageSquare },
];

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setActiveGroupId } = useActiveGroup();
  const queryClient = useQueryClient();
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: checkins } = useGroupCheckins(id);
  const leaveGroup = useLeaveGroup();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("geral");

  // Realtime subscription for checkins
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-checkins-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `group_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checkins", id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  // Also subscribe to member changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-members-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["group-members", id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  const alreadyChecked = checkins && user ? hasCheckedInToday(checkins, user.id) : false;

  const handleLeave = () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      leaveGroup.mutate(id, {
        onSuccess: () => {
          setActiveGroupId(null);
          navigate("/grupos");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-subtle bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-2xl" onClick={() => navigate(-1)}>
              <span className="sr-only">Voltar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Button>
            <h1 className="text-h1 truncate flex-1">{group?.name || "Desafio"}</h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mx-auto max-w-md px-5">
          <div className="flex border-b border-subtle">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium transition-colors relative ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 mx-auto max-w-md w-full px-5 py-4">
        {activeTab === "geral" && id && group && (
          <div className="space-y-4">
            <ChallengeGeneralTab group={group} groupId={id} />

            {/* Leave button */}
            <Button
              variant="ghost"
              onClick={handleLeave}
              className="h-12 w-full rounded-[16px] text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={leaveGroup.isPending}
            >
              {leaveGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Sair do grupo
            </Button>
          </div>
        )}

        {activeTab === "feed" && id && <ChallengeFeedTab challengeId={id} />}

        {activeTab === "chat" && id && <ChallengeChatTab challengeId={id} />}
      </div>

      {/* FAB Check-in (only on General tab) */}
      {id && activeTab === "geral" && (
        <>
          <button
            onClick={() => setCheckinOpen(true)}
            className="fixed bottom-8 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
          <CheckinDialog
            open={checkinOpen}
            onOpenChange={setCheckinOpen}
            groupId={id}
            alreadyCheckedIn={alreadyChecked}
          />
        </>
      )}
    </div>
  );
};

export default GroupDetails;
