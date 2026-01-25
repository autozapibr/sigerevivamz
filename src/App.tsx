import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import Dashboard from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { StudentDetail } from "./pages/StudentDetail";
import Teachers from "./pages/Teachers";
import Turmas from "./pages/Turmas";
import Evaluations from "./pages/Evaluations";
import Enrollments from "./pages/Enrollments";
import Matriculas from "./pages/Matriculas";
import Financial from "./pages/Financial";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import DevSeed from "./pages/DevSeed";
import Settings from "./pages/Settings";

import CaixaPage from "./pages/financial/CaixaPage";
import PropinasPage from "./pages/financial/PropinasPage";
import CobrancasPage from "./pages/financial/CobrancasPage";
import RelatoriosFinanceirosPage from "./pages/financial/RelatoriosFinanceirosPage";
import CalendarioPage from "./pages/CalendarioPage";
import BibliotecaPage from "./pages/BibliotecaPage";
import CalendarioProvasPage from "./pages/pedagogico/CalendarioProvasPage";
import PlanoAulasPage from "./pages/pedagogico/PlanoAulasPage";
import CurriculoPage from "./pages/pedagogico/CurriculoPage";
import ColaboradoresPage from "./pages/rh/ColaboradoresPage";
import DocumentacaoPage from "./pages/rh/DocumentacaoPage";
import ContratosPage from "./pages/rh/ContratosPage";
import SignContract from "./pages/SignContract";

const queryClient = new QueryClient();

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/dashboard" replace />} 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/turmas"
        element={
          <ProtectedRoute>
            <Turmas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollments"
        element={
          <ProtectedRoute>
            <Enrollments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matriculas"
        element={
          <ProtectedRoute>
            <Matriculas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/avaliacoes"
        element={
          <ProtectedRoute>
            <Evaluations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro"
        element={
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disciplinas"
        element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presencas"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      {/* Rotas de Gestão Financeira */}
      <Route
        path="/financeiro/caixa"
        element={
          <ProtectedRoute>
            <CaixaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/propinas"
        element={
          <ProtectedRoute>
            <PropinasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/cobrancas"
        element={
          <ProtectedRoute>
            <CobrancasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/relatorios"
        element={
          <ProtectedRoute>
            <RelatoriosFinanceirosPage />
          </ProtectedRoute>
        }
      />
      {/* Rotas de Gestão Escolar */}
      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <CalendarioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/biblioteca"
        element={
          <ProtectedRoute>
            <BibliotecaPage />
          </ProtectedRoute>
        }
      />
      {/* Rotas de Gestão Pedagógica */}
      <Route
        path="/calendario-provas"
        element={
          <ProtectedRoute>
            <CalendarioProvasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plano-aulas"
        element={
          <ProtectedRoute>
            <PlanoAulasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/curriculo"
        element={
          <ProtectedRoute>
            <CurriculoPage />
          </ProtectedRoute>
        }
      />
      {/* Rotas de Recursos Humanos */}
      <Route
        path="/colaboradores"
        element={
          <ProtectedRoute>
            <ColaboradoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/documentacao"
        element={
          <ProtectedRoute>
            <DocumentacaoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/contratos"
        element={
          <ProtectedRoute>
            <ContratosPage />
          </ProtectedRoute>
        }
      />
      {/* Rota pública para assinatura de contratos */}
      <Route path="/assinar/:token" element={<SignContract />} />
      <Route path="/dev/seed" element={<DevSeed />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
