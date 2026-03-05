import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";
import { Trophy } from "lucide-react";

const CompletedChallenges = () => {
  return (
    <AppScaffold title="Desafios concluídos" showBack>
      <EmptyState
        icon={Trophy}
        title="Nenhum desafio concluído"
        description="Quando um desafio terminar, ele aparecerá aqui."
      />
    </AppScaffold>
  );
};

export default CompletedChallenges;
