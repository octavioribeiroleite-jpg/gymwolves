import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5">
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-[8%] left-1/2 -translate-x-1/2 -translate-y-1/4"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, hsl(142 71% 45% / 0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <img
          src={logo}
          alt="GymWoves"
          className="mb-1 object-contain"
          style={{ height: "200px", width: "200px", filter: "drop-shadow(0 0 20px hsl(142 71% 45% / 0.15))" }}
        />

        <h1 className="text-[48px] font-bold leading-none tracking-tight">
          GymWoves
        </h1>

        <p className="mt-1.5 text-caption font-medium tracking-[0.25em] uppercase text-muted-foreground">
          TREINE • EVOLUA • REPITA
        </p>

        {/* Form */}
        <div className="mt-8 w-full rounded-[24px] surface-1 border border-subtle p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  className="h-[52px] rounded-[16px] border-subtle bg-secondary pl-12 text-body"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[52px] rounded-[16px] border-subtle bg-secondary pl-12 text-body"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-[52px] rounded-[16px] border-subtle bg-secondary pl-12 text-body"
              />
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-[18px] text-body font-bold uppercase tracking-widest glow-primary"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "ENTRAR" : "CRIAR CONTA"}
            </Button>
          </form>

          <div className="mt-5 text-center text-subtitle text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary transition-colors hover:opacity-80">
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
