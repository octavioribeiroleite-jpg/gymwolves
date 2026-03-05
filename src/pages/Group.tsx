import { useState } from "react";
import { useUserGroups, useGroupMembers, useCreateGroup, useJoinGroup } from "@/hooks/useGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Loader2, Users, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (group) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card px-4 py-4">
          <h1 className="mx-auto max-w-md font-display text-xl font-bold">Meu Grupo</h1>
        </header>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">{group.name}</CardTitle>
              <CardDescription>Código de convite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-center font-mono text-lg tracking-widest">
                  {group.invite_code}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Compartilhe este código com seu parceiro(a)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Users className="h-4 w-4" /> Membros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members?.map((m) => {
                const p = m.profiles as any;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="font-medium">{p?.display_name || "Sem nome"}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {m.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                  </div>
                );
              })}
              {(!members || members.length < 2) && (
                <p className="text-sm text-muted-foreground">
                  Aguardando parceiro(a) entrar com o código...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card px-4 py-4">
        <h1 className="mx-auto max-w-md font-display text-xl font-bold">Grupo</h1>
      </header>
      <div className="mx-auto max-w-md p-4">
        <div className="mb-4 flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("create")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "create" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Criar Grupo
          </button>
          <button
            onClick={() => setTab("join")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "join" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Entrar com Código
          </button>
        </div>

        {tab === "create" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Criar Novo Grupo</CardTitle>
              <CardDescription>Crie um grupo para você e seu parceiro(a)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do grupo</Label>
                  <Input
                    placeholder="Ex: João & Maria"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createGroup.isPending}>
                  {createGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Grupo
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <UserPlus className="h-5 w-5" /> Entrar em um Grupo
              </CardTitle>
              <CardDescription>Use o código de convite do seu parceiro(a)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Código de convite</Label>
                  <Input
                    placeholder="Ex: a1b2c3d4"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    className="font-mono tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={joinGroup.isPending}>
                  {joinGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar no Grupo
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Group;
