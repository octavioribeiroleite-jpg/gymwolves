import { useMemo } from "react";
import { useGroupCheckins } from "@/hooks/useCheckins";
import { useGroupMembers } from "@/hooks/useGroupData";
import SectionTitle from "@/components/ds/SectionTitle";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSignedUrl } from "@/hooks/useSignedUrl";

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
}

const ActivityFeed = ({ groupId }: ActivityFeedProps) => {
  const { data: checkins } = useGroupCheckins(groupId);
  const { data: members } = useGroupMembers(groupId);

  const feed = useMemo(() => {
    if (!checkins || !members) return [];

    const profileMap = new Map<string, string>();
    members.forEach((m) => {
      const profile = m.profiles as any;
      profileMap.set(m.user_id, profile?.display_name || "Sem nome");
    });

    return [...checkins]
      .sort((a, b) => new Date(b.checkin_at).getTime() - new Date(a.checkin_at).getTime())
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: profileMap.get(c.user_id) || "Sem nome",
        title: c.title,
        workoutType: (c as any).workout_type || "musculacao",
        proofUrl: c.proof_url,
        time: c.checkin_at,
      }));
  }, [checkins, members]);

  if (feed.length === 0) return null;

  return (
    <div className="rounded-[20px] surface-1 border border-subtle p-4">
      <SectionTitle>Atividade do grupo</SectionTitle>
      <div className="mt-3 space-y-3">
        {feed.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const FeedItem = ({ item }: { item: { id: string; name: string; title: string; workoutType: string; proofUrl: string | null; time: string } }) => {
  const signedUrl = useSignedUrl(item.proofUrl);
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
        {WORKOUT_EMOJIS[item.workoutType] || "⚡"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body">
          <span className="font-bold">{item.name}</span>{" "}
          <span className="text-muted-foreground">treinou</span>{" "}
          <span className="text-primary font-medium">{item.title}</span>
        </p>
        {signedUrl && (
          <img src={signedUrl} alt="Foto do treino" className="mt-2 h-32 w-full rounded-xl object-cover" />
        )}
        <p className="mt-1 text-caption text-muted-foreground">
          {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </div>
  );
};

export default ActivityFeed;
