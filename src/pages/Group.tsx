import { useState } from "react";
import { useUserGroups, useGroupMembers, useCreateGroup, useJoinGroup } from "@/hooks/useGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Loader2, Users, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

const Group = () => {
  const { data: groups, isLoading } = useUserGroups();
  const group = groups?.[0];
  const { data: members } = useGroupMembers(group?.id);
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    createGroup.mutate(groupName.trim());
    setGroupName("");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinGroup.mutate(inviteCode.trim());
    setInviteCode("");
  };

  const copyCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success("Código copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (group) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto max-w-md">
            <h1 className="font-display text-xl font-bold">Meu Grupo</h1>
          </div>
        </header>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Card className="border-0">
            <CardContent className="p-5">
              <h2 className="font-display text-lg font-bold">{group.name}</h2>
              <p className="mb-3 text-xs text-muted-foreground">Código de convite</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                  {group.invite_code}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode} className="h-12 w-12 rounded-xl border-0 bg-secondary">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Compartilhe este código com seu parceiro(a)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0">
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold font-display">
                <Users className="h-4 w-4 text-primary" /> Membros
              </h3>
              <div className="space-y-2">
                {members?.map((m) => {
                  const p = m.profiles as any;
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                      <span className="font-medium">{p?.display_name || "Sem nome"}</span>
                      <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        Ativo
                      </span>
                    </div>
                  );
                })}
                {(!members || members.length < 2) && (
                  <p className="rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    Aguardando parceiro(a) entrar...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Grupo</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md p-4">
        <div className="mb-4 flex rounded-xl bg-card p-1">
          <button
            onClick={() => setTab("create")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
              tab === "create" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Criar Grupo
          </button>
          <button
            onClick={() => setTab("join")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
              tab === "join" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Entrar com Código
          </button>
        </div>

        <Card className="border-0">
          <CardContent className="p-5">
            {tab === "create" ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Nome do grupo</Label>
                  <Input
                    placeholder="Ex: João & Maria"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    className="h-12 rounded-xl border-0 bg-secondary"
                  />
                </div>
                <Button type="submit" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary" disabled={createGroup.isPending}>
                  {createGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Grupo
                </Button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Código de convite</Label>
                  <Input
                    placeholder="Ex: a1b2c3d4"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    className="h-12 rounded-xl border-0 bg-secondary font-mono tracking-widest"
                  />
                </div>
                <Button type="submit" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary" disabled={joinGroup.isPending}>
                  {joinGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar no Grupo
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Group;
