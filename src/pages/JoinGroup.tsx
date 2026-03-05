import { useState } from "react";
import { useJoinGroup } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Users } from "lucide-react";
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
    <AppScaffold title="Juntar-se ao grupo" showBack hideNav>
      <div className="rounded-[20px] surface-1 border border-subtle p-5">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
          <LogIn className="h-8 w-8 text-primary" />
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-small font-medium text-muted-foreground">Link de convite</Label>
            <Input
              placeholder="Cole o código ou link de convite"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="h-[52px] rounded-[16px] border-subtle bg-secondary font-mono text-center text-lg tracking-[0.2em]"
            />
          </div>

          <p className="text-small text-muted-foreground text-center">
            Exemplos: <span className="text-foreground font-mono">a1b2c3d4</span> ou link de convite
          </p>

          <Button type="submit" className="h-14 w-full rounded-[18px] text-body font-bold glow-primary" disabled={joinGroup.isPending}>
            {joinGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Juntar
          </Button>
        </form>
      </div>

      <button
        onClick={() => navigate("/grupos")}
        className="w-full text-center py-3 text-small text-primary font-medium"
      >
        <Users className="inline h-4 w-4 mr-1" />
        Explorar a Matilha
      </button>
    </AppScaffold>
  );
};

export default JoinGroup;
