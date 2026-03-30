import { useNavigate } from "react-router-dom";
import { Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserGroups } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import HomeChallengeCard from "./HomeChallengeCard";

const HomeChallengesList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeGroupId } = useActiveGroup();
  const { data: groups, isLoading } = useUserGroups();

  if (isLoading) return null;

  // Show only the active group, or the first one
  const activeGroup = groups?.find((g) => g.id === activeGroupId) || groups?.[0];

  return (
    <div>
      <h2 className="text-[13px] font-bold mb-2">Desafio ativo</h2>

      {activeGroup ? (
        <HomeChallengeCard group={activeGroup} userId={user!.id} />
      ) : (
        <div className="rounded-2xl surface-1 border border-subtle p-5 text-center card-shadow">
          <p className="text-[13px] text-muted-foreground mb-3">
            Você ainda não participa de nenhum desafio
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-9 text-[13px]"
              onClick={() => navigate("/grupos/criar")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-9 text-[13px]"
              onClick={() => navigate("/grupos/entrar")}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Entrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeChallengesList;
