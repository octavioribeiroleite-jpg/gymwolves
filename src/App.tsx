import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActiveGroupProvider } from "@/contexts/ActiveGroupContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GroupList from "./pages/GroupList";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import InviteScreen from "./pages/InviteScreen";
import GroupDetails from "./pages/GroupDetails";
import History from "./pages/History";
import Ranking from "./pages/Ranking";
import Profile from "./pages/Profile";
import ScoringSelect from "./pages/ScoringSelect";
import CompletedChallenges from "./pages/CompletedChallenges";
import Devices from "./pages/Devices";
import NotFound from "./pages/NotFound";
import PwaInstallPrompt from "./components/PwaInstallPrompt";

const queryClient = new QueryClient();

const App = () => {
  const alreadyShown = sessionStorage.getItem("splash_shown") === "1";
  const [splashDone, setSplashDone] = useState(alreadyShown);
  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem("splash_shown", "1");
    setSplashDone(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
        {splashDone && <PwaInstallPrompt />}
        <BrowserRouter>
          <AuthProvider>
            <ActiveGroupProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/grupos" element={<ProtectedRoute><GroupList /></ProtectedRoute>} />
                <Route path="/grupos/criar" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
                <Route path="/grupos/entrar" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
                <Route path="/grupos/:id/convidar" element={<ProtectedRoute><InviteScreen /></ProtectedRoute>} />
                <Route path="/grupos/:id/detalhes" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
                <Route path="/historico" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/pontuacao" element={<ProtectedRoute><ScoringSelect /></ProtectedRoute>} />
                <Route path="/desafios-concluidos" element={<ProtectedRoute><CompletedChallenges /></ProtectedRoute>} />
                <Route path="/dispositivos" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ActiveGroupProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
