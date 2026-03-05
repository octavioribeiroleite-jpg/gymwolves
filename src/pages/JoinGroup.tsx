import { useState } from "react";
import { useJoinGroup } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";

const JoinGroup = () => {
  const [code, setCode] = useState("");
  const joinGroup = useJoinGroup();
  const { setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    joinGroup.mutate(code.trim(), {
      onSuccess: (group) => {
        setActiveGroupId(group.id);
        navigate("/");
      },
    });
  };

  return (
    <AppScaffold title="Entrar com Convite" showBack>
      <Card className="border-0">
        <CardContent className="p-5">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <p className="mb-4 text-center text-description text-muted-foreground">
            Insira o código de convite para entrar em um desafio.
          </p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Código de convite</Label>
              <Input
                placeholder="Ex: a1b2c3d4"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-12 rounded-2xl border-0 bg-secondary font-mono text-center text-lg tracking-[0.3em]"
              />
            </div>
            <Button type="submit" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary" disabled={joinGroup.isPending}>
              {joinGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar no Desafio
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppScaffold>
  );
};

export default JoinGroup;
