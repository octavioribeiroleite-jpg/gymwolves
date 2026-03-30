import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupCheckins } from "@/hooks/useCheckins";
import { useGroupMembers } from "@/hooks/useGroupData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { ChevronRight } from "lucide-react";

const WORKOUT_EMOJIS: Record<string, string> = {
  musculacao: "🏋️",
  corrida: "🏃",
  crossfit: "💪",
  natacao: "🏊",
  ciclismo: "🚴",
  yoga: "🧘",
  luta: "🥊",
  outro: "⚡",
};

interface ActivityFeedProps {
  groupId: string;
  compact?: boolean;
  maxItems?: number;
}

const ActivityFeed = ({ groupId, compact = false, maxItems }: ActivityFeedProps) => {
  const navigate = useNavigate();
  const { data: checkins } = useGroupCheckins(groupId);
  const { data: members } = useGroupMembers(groupId);

  const feed = useMemo(() => {
    if (!checkins || !members) return [];

    const profileMap = new Map<string, string>();
    members.forEach((m) => {
      const profile = m.profiles as any;
      profileMap.set(m.user_id, profile?.display_name || "Sem nome");
    });

    const limit = maxItems ?? (compact ? 3 : 10);

    return [...checkins]
      .sort((a, b) => new Date(b.checkin_at).getTime() - new Date(a.checkin_at).getTime())
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        name: profileMap.get(c.user_id) || "Sem nome",
        title: c.title,
        workoutType: (c as any).workout_type || "musculacao",
        proofUrl: c.proof_url,
        time: c.checkin_at,
      }));
  }, [checkins, members, compact, maxItems]);

  if (feed.length === 0) return null;

  return (
    <div className="rounded-2xl surface-1 border border-subtle p-3.5 card-shadow">
      <h2 className="text-[13px] font-bold mb-2">Atividade da matilha</h2>
      <div className="space-y-2">
        {feed.map((item) => (
          <FeedItem key={item.id} item={item} compact={compact} />
        ))}
      </div>
      {compact && (
        <button
          onClick={() => navigate(`/grupos/${groupId}/detalhes`)}
          className="flex items-center justify-center gap-1 w-full mt-2.5 pt-2.5 border-t border-subtle text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver feed completo
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

const FeedItem = ({ item, compact }: { item: { id: string; name: string; title: string; workoutType: string; proofUrl: string | null; time: string }; compact?: boolean }) => {
  const signedUrl = useSignedUrl(item.proofUrl);
  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm">
        {WORKOUT_EMOJIS[item.workoutType] || "⚡"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-tight">
          <span className="font-bold">{item.name}</span>{" "}
          <span className="text-muted-foreground">·</span>{" "}
          <span className="text-primary font-medium">{item.title}</span>
        </p>
        {!compact && signedUrl && (
          <img src={signedUrl} alt="Foto do treino" className="mt-1.5 h-28 w-full rounded-xl object-cover" />
        )}
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      {compact && signedUrl && (
        <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden">
          <img src={signedUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
