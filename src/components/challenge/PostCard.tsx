import { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PostCardProps {
  post: any;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  currentUserId?: string;
  onEdit?: (postId: string, caption: string) => void;
  onDelete?: (postId: string) => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

const PostCard = ({ post, isLiked, onLike, onComment, currentUserId, onEdit, onDelete }: PostCardProps) => {
  const profile = post.profiles as any;
  const name = profile?.display_name || "Sem nome";
  const isAuthor = currentUserId && post.user_id === currentUserId;
  const [editOpen, setEditOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");

  const handleEditOpen = () => {
    setEditCaption(post.caption || "");
    setEditOpen(true);
  };

  const handleEditSave = () => {
    onEdit?.(post.id, editCaption);
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (confirm("Excluir este post?")) {
      onDelete?.(post.id);
    }
  };

  return (
    <>
      <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold text-primary">{getInitials(name)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          {isAuthor && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEditOpen}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="w-full aspect-square bg-secondary">
            <img src={post.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-4">
            <button onClick={onLike} className="flex items-center gap-1.5 text-[13px] transition-colors">
              <Heart className={`h-5 w-5 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`} />
              <span className={isLiked ? "text-red-500 font-medium" : "text-muted-foreground"}>{post.likes_count || 0}</span>
            </button>
            <button onClick={onComment} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count || 0}</span>
            </button>
          </div>

          {post.caption && (
            <p className="text-[14px]">
              <span className="font-bold mr-1.5">{name.split(" ")[0]}</span>
              {post.caption}
            </p>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            placeholder="Escreva algo..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
