import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2, Users, Loader2, Check, Plus, Settings, CalendarDays, Trophy } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "@/components/BottomNav";
import CheckinDialog from "@/components/CheckinDialog";
import FloatingActionButton from "@/components/FloatingActionButton";

const InviteScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: members } = useGroupMembers(id);
  const [tab, setTab] = useState<"detalhes" | "classificacoes" | "chat">("detalhes");
  const [checkinOpen, setCheckinOpen] = useState(false);

  const inviteCode = group?.invite_code || "";
  const groupAny = group as any;
  const daysRemaining = groupAny?.end_date
    ? Math.max(0, differenceInDays(new Date(groupAny.end_date), new Date()))
    : null;

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Código copiado!");
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🐺 Entre no meu desafio GYM WOLVES!\n\nDesafio: ${group?.name}\nCódigo: ${inviteCode}\n\nBaixe o app e use o código para participar!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (user?.user_metadata?.display_name || user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with avatar and days remaining */}
      <header className="border-b border-subtle bg-background px-5 py-4">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-small font-bold text-primary">
                {initials}
              </div>
              <div>
                <p className="text-body font-bold">{group?.name}</p>
                {daysRemaining !== null && (
                  <p className="text-small text-muted-foreground">{daysRemaining} dias restantes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Internal tabs */}
      <div className="border-b border-subtle bg-background">
        <div className="mx-auto max-w-md flex">
          {(["detalhes", "classificacoes", "chat"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-small font-medium text-center transition-colors border-b-2 ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {t === "detalhes" && "Detalhes"}
              {t === "classificacoes" && "Classificações"}
              {t === "chat" && "Bate-papo"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-5 py-4">
        {tab === "detalhes" && (
          <>
            {/* Success card */}
            <div className="rounded-[20px] surface-1 border border-subtle p-5">
              <h2 className="text-h2">Desafio criado! 🎉</h2>
              <p className="text-small text-muted-foreground mt-2">
                Parabéns por criar o seu desafio. Aqui estão algumas etapas para ajudá-lo a começar.
              </p>
            </div>

            {/* Action list */}
            <div className="rounded-[20px] surface-1 border border-subtle overflow-hidden">
              <button
                onClick={copyCode}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2 border-b border-subtle"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">Convidar membros</p>
                  <p className="text-small text-muted-foreground">Compartilhe o link de convite</p>
                </div>
              </button>
              <button
                onClick={() => navigate(`/grupos/${id}/detalhes`)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">Personalizar grupo</p>
                  <p className="text-small text-muted-foreground">Configurar regras e permissões</p>
                </div>
              </button>
            </div>

            {/* Invite code */}
            <div className="rounded-[20px] surface-1 border border-subtle p-5">
              <p className="text-small text-muted-foreground mb-3">Código de convite</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-[16px] bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                  {inviteCode}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-[16px] border-subtle bg-secondary">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={copyCode} variant="outline" className="h-14 rounded-[18px] border-subtle bg-surface-1 text-body font-bold">
                <Copy className="mr-2 h-4 w-4" /> Copiar código
              </Button>
              <Button onClick={shareWhatsApp} className="h-14 rounded-[18px] bg-[#25D366] text-body font-bold text-primary-foreground hover:bg-[#20BD5A]">
                <Share2 className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </div>

            {/* Members */}
            <div className="rounded-[20px] surface-1 border border-subtle p-5">
              <h3 className="text-h2 flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" /> Membros ({members?.length ?? 0})
              </h3>
              <div className="space-y-2">
                {members?.map((m) => {
                  const profile = m.profiles as any;
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-[16px] bg-secondary px-4 py-3">
                      <span className="text-body font-medium">{profile?.display_name || "Sem nome"}</span>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={() => navigate("/")} className="h-14 w-full rounded-[18px] text-body font-bold glow-primary">
              Ir para o desafio
            </Button>
          </>
        )}

        {tab === "classificacoes" && (
          <div className="py-16 text-center">
            <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-body text-muted-foreground">Classificações aparecerão quando houver check-ins.</p>
          </div>
        )}

        {tab === "chat" && (
          <div className="py-16 text-center">
            <p className="text-body text-muted-foreground">Bate-papo em breve.</p>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setCheckinOpen(true)} />

      {id && (
        <CheckinDialog
          open={checkinOpen}
          onOpenChange={setCheckinOpen}
          groupId={id}
          alreadyCheckedIn={false}
        />
      )}
      <BottomNav />
    </div>
  );
};

export default InviteScreen;
