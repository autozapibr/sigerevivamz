import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Mail, Lock, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import logoReviva from '@/assets/escola-reviva-logo.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ email, password });
      toast({
        title: "Bem-vindo ao SiGER!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error?.message || "Credenciais inválidas.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary">
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl"
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex flex-col items-start gap-4 mb-8">
              <img src={logoReviva} alt="Escola Reviva" className="w-32 h-20 object-contain" />
              <div className="text-left">
                <h1 className="text-4xl font-bold mb-1">SiGER</h1>
                <p className="text-white/80 text-base">Sistema de Gestão Escolar Reviva</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Transforme a gestão
              <br />
              <span className="text-primary-light">da sua escola</span>
            </h2>

            <p className="text-lg text-white/80 mb-8 max-w-md">
              Plataforma completa para escolas moçambicanas. 
              Matrículas, notas, presenças e finanças num só lugar.
            </p>

            <div className="space-y-4">
              {[
                'Pauta Digital conforme MEC',
                'Controlo financeiro em MZN',
                'Relatórios automáticos',
              ].map((feature, i) => (
                <motion.div 
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 120" fill="none">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white" fillOpacity="0.05"
          />
        </svg>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute top-4 right-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <motion.div initial={false} animate={{ rotate: isDark ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </motion.div>
        </Button>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden flex flex-col items-start gap-3 mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <img src={logoReviva} alt="Escola Reviva" className="w-24 h-16 object-contain" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">SiGER</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão Escolar Reviva</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mb-8">Entre na sua conta para continuar</p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@escolareviva.com"
                  className="pl-11 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Palavra-passe</Label>
                <button type="button" className="text-xs text-primary hover:underline">Esqueceu?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a sua palavra-passe"
                  className="pl-11 pr-11 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary-dark text-primary-foreground font-medium transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <span className="text-primary font-medium">
              Contacte a administração da escola
            </span>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            © 2026 SiGER - Sistema de Gestão Escolar Reviva
            <br />
            Feito com ❤️ por{' '}
            <a href="https://autozapi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AutoZapi
            </a>{' '}
            Soluções em TI, AI e Automações.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
