import { useState } from "react";
import { Dumbbell, Trophy, Clock, Flame, MapPin, Heart, MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { Input } from "@/components/ui/input";
import {
  useCheckinComments,
  useAddCheckinComment,
} from "@/hooks/useCheckinInteractions";

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

interface CheckinFeedItemProps {
  checkin: any;
  groupNames: string[];
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
}

const CheckinFeedItem = ({ checkin, groupNames, isLiked, likesCount, onLike }: CheckinFeedItemProps) => {
  const profile = checkin.profiles as any;
  const name = profile?.display_name || "Sem nome";
  const imageUrl = useSignedUrl(checkin.proof_url);

  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: comments } = useCheckinComments(checkin.id);
  const addComment = useAddCheckinComment();

  const commentsCount = comments?.length || 0;
  const previewComments = comments?.slice(-2) || [];
  const allComments = comments || [];

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(
      { checkinId: checkin.id, text: commentText.trim() },
      { onSuccess: () => setCommentText("") }
    );
  };

  return (
    <div className="space-y-1.5">
      {groupNames.length > 0 && (
        <div className="flex items-center gap-1.5 px-1 flex-wrap">
          <Trophy className="h-3 w-3 text-primary shrink-0" />
          {groupNames.map((g) => (
            <span
              key={g}
              className="text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5"
            >
              {g}
            </span>
          ))}
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

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <button onClick={onLike} className="flex items-center gap-1.5 text-[13px] transition-colors">
              <Heart className={`h-5 w-5 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`} />
              <span className={isLiked ? "text-red-500 font-medium" : "text-muted-foreground"}>{likesCount}</span>
            </button>
            <button onClick={() => setShowAllComments(!showAllComments)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{commentsCount}</span>
            </button>
          </div>

          {commentsCount > 2 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-[13px] text-muted-foreground"
            >
              Ver todos os {commentsCount} comentários
            </button>
          )}

          {showAllComments ? (
            <div className="space-y-1.5">
              {allComments.map((c: any) => {
                const cName = (c.profiles as any)?.display_name || "Sem nome";
                return (
                  <p key={c.id} className="text-[13px]">
                    <span className="font-bold mr-1.5">{cName.split(" ")[0]}</span>
                    <span className="text-foreground/90">{c.text}</span>
                  </p>
                );
              })}
            </div>
          ) : (
            previewComments.length > 0 && (
              <div className="space-y-1">
                {previewComments.map((c: any) => {
                  const cName = (c.profiles as any)?.display_name || "Sem nome";
                  return (
                    <p key={c.id} className="text-[13px]">
                      <span className="font-bold mr-1.5">{cName.split(" ")[0]}</span>
                      <span className="text-foreground/90">{c.text}</span>
                    </p>
                  );
                })}
              </div>
            )
          )}

          {/* Inline comment input */}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 border-0 bg-transparent px-0 h-8 text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            {commentText.trim() && (
              <button
                onClick={handleSendComment}
                disabled={addComment.isPending}
                className="text-[13px] font-semibold text-primary shrink-0 disabled:opacity-50"
              >
                {addComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publicar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinFeedItem;
