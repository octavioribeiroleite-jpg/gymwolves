import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallengeMessages, useChatRealtime, useSendMessage } from "@/hooks/useChallengeChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  challengeId: string;
}

const getInitials = (name: string) =>
  name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

const ChallengeChatTab = ({ challengeId }: Props) => {
  const { user } = useAuth();
  const { data: messages, isLoading } = useChallengeMessages(challengeId, true);
  useChatRealtime(challengeId, true);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate(
      { challengeId, text: text.trim() },
      { onSuccess: () => setText("") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
      {/* Messages */}
      <div className="flex-1 space-y-3 pb-4">
        {(!messages || messages.length === 0) ? (
          <div className="rounded-[20px] surface-1 border border-subtle p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-[14px] text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-[12px] text-muted-foreground">Comece a conversa!</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const profile = msg.profiles as any;
            const name = profile?.display_name || "Sem nome";
            const isMe = msg.user_id === user?.id;

            return (
              <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">{getInitials(name)}</span>
                  )}
                </div>
                <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                  <div
                    className={`rounded-[16px] px-3.5 py-2.5 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-[4px]"
                        : "surface-1 border border-subtle rounded-bl-[4px]"
                    }`}
                  >
                    {!isMe && <p className="text-[11px] font-bold text-primary mb-0.5">{name}</p>}
                    <p className="text-[13px]">{msg.text}</p>
                  </div>
                  <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? "text-right" : ""}`}>
                    {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background pt-2 pb-4 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-full h-11 text-[13px]"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
          className="h-11 w-11 rounded-full shrink-0"
        >
          {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChallengeChatTab;
