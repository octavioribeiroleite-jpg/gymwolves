import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { dispatchCheckinOpen } from "@/hooks/useCheckinEvent";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <>
      {children}
      <BottomNav onCheckin={dispatchCheckinOpen} />
    </>
  );
};

export default ProtectedRoute;
