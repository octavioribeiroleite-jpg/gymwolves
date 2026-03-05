import { useParams, useNavigate } from "react-router-dom";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2, Users, Loader2, Check } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import SectionTitle from "@/components/ds/SectionTitle";

const InviteScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: members } = useGroupMembers(id);

  const inviteCode = group?.invite_code || "";

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

  return (
    <AppScaffold title="Convidar" showBack>
      {/* Success card */}
      <div className="rounded-[20px] surface-1 border border-subtle p-5">
        <h2 className="text-h2">Desafio criado! 🎉</h2>
        <p className="text-subtitle text-muted-foreground mt-1">
          Parabéns por criar o seu desafio. Compartilhe o código para convidar membros.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <code className="flex-1 rounded-[16px] bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
            {inviteCode}
          </code>
          <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-[16px] border-subtle bg-secondary">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Share buttons */}
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
        <SectionTitle>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Membros ({members?.length ?? 0})
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-2">
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
    </AppScaffold>
  );
};

export default InviteScreen;
