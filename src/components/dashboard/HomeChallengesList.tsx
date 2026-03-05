import { useNavigate } from "react-router-dom";
import { Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserGroups } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import HomeChallengeCard from "./HomeChallengeCard";

const HomeChallengesList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: groups, isLoading } = useUserGroups();

  if (isLoading) return null;

  return (
    <div>
      <h2 className="text-[15px] font-bold mb-3">Meus Desafios</h2>

      {groups && groups.length > 0 ? (
        <div className="space-y-3">
          {groups.map((g) => (
            <HomeChallengeCard key={g.id} group={g} userId={user!.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] surface-1 border border-subtle p-6 text-center">
          <p className="text-[14px] text-muted-foreground mb-2">
            Você ainda não participa de nenhum desafio
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          className="flex-1 rounded-2xl h-10 text-[13px]"
          onClick={() => navigate("/create-group")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Criar desafio
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-2xl h-10 text-[13px]"
          onClick={() => navigate("/join")}
        >
          <LogIn className="h-4 w-4 mr-1" />
          Entrar com código
        </Button>
      </div>
    </div>
  );
};

export default HomeChallengesList;
