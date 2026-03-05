import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { usePostComments, useAddComment } from "@/hooks/useChallengePosts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  postId: string | null;
  challengeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

const CommentsSheet = ({ postId, challengeId, open, onOpenChange }: Props) => {
  const { data: comments, isLoading } = usePostComments(open ? postId : null);
  const addComment = useAddComment();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || !postId) return;
    addComment.mutate(
      { postId, text: text.trim(), challengeId },
      { onSuccess: () => setText("") }
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Comentários</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 max-h-[50vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((c: any) => {
              const profile = c.profiles as any;
              const name = profile?.display_name || "Sem nome";
              return (
                <div key={c.id} className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-[10px] font-bold text-primary">{getInitials(name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-bold">{name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground/90">{c.text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-[13px] text-muted-foreground py-8">Nenhum comentário ainda</p>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-subtle">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva um comentário..."
            className="flex-1 rounded-full h-10 text-[13px]"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || addComment.isPending}
            className="h-10 w-10 rounded-full shrink-0"
          >
            {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentsSheet;
