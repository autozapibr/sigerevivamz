import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Mail, Lock, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Dev users for quick login during development
const DEV_USERS = [
  { email: 'diretoria@escola.mz', password: '123456', role: 'DIRETORIA', color: 'bg-primary' },
  { email: 'secretaria@escola.mz', password: '123456', role: 'SECRETARIA', color: 'bg-secondary' },
  { email: 'financeiro@escola.mz', password: '123456', role: 'FINANCEIRO', color: 'bg-accent' },
  { email: 'professor@escola.mz', password: '123456', role: 'PROFESSOR', color: 'bg-muted' },
];

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ email, password });
      toast({
        title: "Bem-vindo ao SGE REVIVA!",
        description: "Login realizado com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error?.message || "Credenciais inválidas.",
        variant: "destructive",
      });
    }
  };

  const handleDevLogin = async (devUser: typeof DEV_USERS[0]) => {
    try {
      await login({ email: devUser.email, password: devUser.password });
      toast({
        title: `Logado como ${devUser.role}`,
        description: `Bem-vindo ao modo de desenvolvimento!`,
      });
    } catch (error: any) {
      toast({
        title: "Usuário não existe",
        description: "Clique em 'Criar usuários de teste' primeiro.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="surface-card shadow-xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                SGE REVIVA
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sistema de Gestão Escolar - Moçambique
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* DEV Quick Login Panel */}
            {showDevPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Login Rápido (Dev)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => setShowDevPanel(false)}
                  >
                    Ocultar
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {DEV_USERS.map((user) => (
                    <Button
                      key={user.email}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleDevLogin(user)}
                      className="flex items-center gap-2 h-auto py-2 hover:bg-primary/10 hover:border-primary"
                    >
                      <User className="w-3 h-3" />
                      <span className="text-xs">{user.role}</span>
                    </Button>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Primeiro, <Link to="/dev/seed" className="text-primary hover:underline font-medium">crie os usuários</Link>
                </p>
              </motion.div>
            )}

            {!showDevPanel && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => setShowDevPanel(true)}
              >
                <Zap className="w-3 h-3 mr-1" /> Mostrar Login Rápido
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou entre manualmente</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}