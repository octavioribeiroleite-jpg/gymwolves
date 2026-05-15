import { Dumbbell, Trophy, Clock, Flame, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSignedUrl } from "@/hooks/useSignedUrl";

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

interface CheckinFeedItemProps {
  checkin: any;
  groupName: string;
}

const CheckinFeedItem = ({ checkin, groupName }: CheckinFeedItemProps) => {
  const profile = checkin.profiles as any;
  const name = profile?.display_name || "Sem nome";
  const imageUrl = useSignedUrl(checkin.proof_url);

  return (
    <div className="space-y-1.5">
      {groupName && (
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
          <Trophy className="h-3 w-3 text-primary" />
          <span className="truncate">{groupName}</span>
        </div>
      )}

      <div className="rounded-2xl surface-1 border border-subtle overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
              {getInitials(name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{name}</div>
            <div className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(checkin.checkin_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
            <Dumbbell className="h-3 w-3" />
            Treinou
          </div>
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="bg-muted/30">
            <img
              src={imageUrl}
              alt="Foto do treino"
              className="w-full max-h-[60vh] object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2">
          <div className="text-[13px] font-semibold">{checkin.title || "Treino"}</div>

          {(checkin.duration_min || checkin.calories || checkin.distance_km) && (
            <div className="flex flex-wrap gap-1.5">
              {checkin.duration_min ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2 py-0.5">
                  <Clock className="h-3 w-3" />
                  {Math.round(checkin.duration_min)}min
                </span>
              ) : null}
              {checkin.calories ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2 py-0.5">
                  <Flame className="h-3 w-3" />
                  {Math.round(checkin.calories)} kcal
                </span>
              ) : null}
              {checkin.distance_km ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2 py-0.5">
                  <MapPin className="h-3 w-3" />
                  {Number(checkin.distance_km).toFixed(1)} km
                </span>
              ) : null}
            </div>
          )}

          {checkin.note && (
            <p className="text-[13px] text-foreground/90 whitespace-pre-wrap">
              {checkin.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinFeedItem;
