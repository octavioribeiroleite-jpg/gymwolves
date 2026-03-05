import { useParams, useNavigate } from "react-router-dom";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy, Share2, Users, Loader2, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";

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
      `🐺 Entre no meu grupo GYM WOLVES!\n\nGrupo: ${group?.name}\nCódigo: ${inviteCode}\n\nBaixe o app e use o código para participar!`
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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => navigate("/grupos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold">Convidar</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <Card className="border-0">
          <CardContent className="p-5">
            <h2 className="font-display text-lg font-bold">{group?.name}</h2>
            <p className="mb-3 mt-1 text-xs text-muted-foreground">Compartilhe o código para convidar membros</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                {inviteCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-xl border-0 bg-secondary">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={copyCode} variant="outline" className="h-14 rounded-2xl border-0 bg-card text-sm font-semibold">
            <Copy className="mr-2 h-4 w-4" /> Copiar Código
          </Button>
          <Button onClick={shareWhatsApp} className="h-14 rounded-2xl bg-[#25D366] text-sm font-semibold text-white hover:bg-[#20BD5A]">
            <Share2 className="mr-2 h-4 w-4" /> WhatsApp
          </Button>
        </div>

        <Card className="border-0">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold font-display">
              <Users className="h-4 w-4 text-primary" /> Membros ({members?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {members?.map((m) => {
                const profile = m.profiles as any;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                    <span className="font-medium">{profile?.display_name || "Sem nome"}</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/")} className="h-14 w-full rounded-2xl text-base font-semibold glow-primary">
          Ir para o Grupo
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default InviteScreen;
