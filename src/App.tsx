import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { InviteRegisterForm } from "./components/auth/InviteRegisterForm";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { CommandPalette } from "./components/shared/CommandPalette";

// Eager (rotas críticas — primeiro paint)
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Lazy (split por chunk)
const Students = lazy(() => import("./pages/Students").then(m => ({ default: m.Students })));
const StudentDetail = lazy(() => import("./pages/StudentDetail").then(m => ({ default: m.StudentDetail })));
const Teachers = lazy(() => import("./pages/Teachers"));
const Turmas = lazy(() => import("./pages/Turmas"));
const Evaluations = lazy(() => import("./pages/Evaluations"));
const Enrollments = lazy(() => import("./pages/Enrollments"));
const Matriculas = lazy(() => import("./pages/Matriculas"));
const Financial = lazy(() => import("./pages/Financial"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Reports = lazy(() => import("./pages/Reports"));

const Settings = lazy(() => import("./pages/Settings"));
const AparenciaPage = lazy(() => import("./pages/settings/AparenciaPage"));
const PerfilPage = lazy(() => import("./pages/settings/PerfilPage"));
const NotificacoesConfigPage = lazy(() => import("./pages/settings/NotificacoesConfigPage"));
const IAConfigPage = lazy(() => import("./pages/settings/IAConfigPage"));
const PlanoAulaConfigPage = lazy(() => import("./pages/settings/PlanoAulaConfigPage"));
const IntegracoesPage = lazy(() => import("./pages/settings/IntegracoesPage"));
const SistemaPage = lazy(() => import("./pages/settings/SistemaPage"));
const UtilizadoresPage = lazy(() => import("./pages/settings/UtilizadoresPage"));
const PerfisUtilizadoresPage = lazy(() => import("./pages/settings/PerfisUtilizadoresPage"));
const RoadmapPage = lazy(() => import("./pages/settings/RoadmapPage"));
const AuditoriaPage = lazy(() => import("./pages/settings/AuditoriaPage"));
const BackupsPage = lazy(() => import("./pages/settings/BackupsPage"));

const CaixaPage = lazy(() => import("./pages/financial/CaixaPage"));
const PropinasPage = lazy(() => import("./pages/financial/PropinasPage"));
const CobrancasPage = lazy(() => import("./pages/financial/CobrancasPage"));
const RelatoriosFinanceirosPage = lazy(() => import("./pages/financial/RelatoriosFinanceirosPage"));
const FinancialDashboard = lazy(() => import("./pages/financial/FinancialDashboard"));

const CalendarioPage = lazy(() => import("./pages/CalendarioPage"));
const BibliotecaPage = lazy(() => import("./pages/BibliotecaPage"));
const CalendarioProvasPage = lazy(() => import("./pages/pedagogico/CalendarioProvasPage"));
const PlanoAulasPage = lazy(() => import("./pages/pedagogico/PlanoAulasPage"));
const CurriculoPage = lazy(() => import("./pages/pedagogico/CurriculoPage"));
const ArquivosPage = lazy(() => import("./pages/pedagogico/ArquivosPage"));

const ColaboradoresPage = lazy(() => import("./pages/rh/ColaboradoresPage"));
const DocumentacaoPage = lazy(() => import("./pages/rh/DocumentacaoPage"));
const ContratosPage = lazy(() => import("./pages/rh/ContratosPage"));
const SignContract = lazy(() => import("./pages/SignContract"));
const ComunicacaoPage = lazy(() => import("./pages/ComunicacaoPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

// Fallback de carregamento (para Suspense)
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">A carregar...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageFallback />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const FinancialRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role === 'ENCARREGADO' || user?.role === 'ALUNO') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
        <Route path="/registar/:token" element={!isAuthenticated ? <InviteRegisterForm /> : <Navigate to="/dashboard" replace />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
        <Route path="/turmas" element={<ProtectedRoute><Turmas /></ProtectedRoute>} />
        <Route path="/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
        <Route path="/matriculas" element={<ProtectedRoute><Matriculas /></ProtectedRoute>} />
        <Route path="/avaliacoes" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><FinancialRoute><Financial /></FinancialRoute></ProtectedRoute>} />
        <Route path="/disciplinas" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/presencas" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/configuracoes/aparencia" element={<ProtectedRoute><AparenciaPage /></ProtectedRoute>} />
        <Route path="/configuracoes/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/configuracoes/notificacoes" element={<ProtectedRoute><NotificacoesConfigPage /></ProtectedRoute>} />
        <Route path="/configuracoes/ia" element={<ProtectedRoute><IAConfigPage /></ProtectedRoute>} />
        <Route path="/configuracoes/plano-aulas" element={<ProtectedRoute><PlanoAulaConfigPage /></ProtectedRoute>} />
        <Route path="/configuracoes/integracoes" element={<ProtectedRoute><IntegracoesPage /></ProtectedRoute>} />
        <Route path="/configuracoes/sistema" element={<ProtectedRoute><SistemaPage /></ProtectedRoute>} />
        <Route path="/configuracoes/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/configuracoes/backups" element={<ProtectedRoute><BackupsPage /></ProtectedRoute>} />
        <Route path="/configuracoes/auditoria" element={<ProtectedRoute><AuditoriaPage /></ProtectedRoute>} />
        <Route path="/rh/utilizadores" element={<ProtectedRoute><UtilizadoresPage /></ProtectedRoute>} />
        <Route path="/configuracoes/perfis-utilizadores" element={<ProtectedRoute><PerfisUtilizadoresPage /></ProtectedRoute>} />
        <Route path="/financeiro/dashboard" element={<ProtectedRoute><FinancialRoute><FinancialDashboard /></FinancialRoute></ProtectedRoute>} />
        <Route path="/financeiro/caixa" element={<ProtectedRoute><FinancialRoute><CaixaPage /></FinancialRoute></ProtectedRoute>} />
        <Route path="/financeiro/propinas" element={<ProtectedRoute><FinancialRoute><PropinasPage /></FinancialRoute></ProtectedRoute>} />
        <Route path="/financeiro/cobrancas" element={<ProtectedRoute><FinancialRoute><CobrancasPage /></FinancialRoute></ProtectedRoute>} />
        <Route path="/financeiro/relatorios" element={<ProtectedRoute><FinancialRoute><RelatoriosFinanceirosPage /></FinancialRoute></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
        <Route path="/biblioteca" element={<ProtectedRoute><BibliotecaPage /></ProtectedRoute>} />
        <Route path="/calendario-provas" element={<ProtectedRoute><CalendarioProvasPage /></ProtectedRoute>} />
        <Route path="/plano-aulas" element={<ProtectedRoute><PlanoAulasPage /></ProtectedRoute>} />
        <Route path="/curriculo" element={<ProtectedRoute><CurriculoPage /></ProtectedRoute>} />
        <Route path="/colaboradores" element={<ProtectedRoute><ColaboradoresPage /></ProtectedRoute>} />
        <Route path="/rh/documentacao" element={<ProtectedRoute><DocumentacaoPage /></ProtectedRoute>} />
        <Route path="/rh/contratos" element={<ProtectedRoute><ContratosPage /></ProtectedRoute>} />
        <Route path="/assinar/:token" element={<SignContract />} />
        <Route path="/comunicacao" element={<ProtectedRoute><ComunicacaoPage /></ProtectedRoute>} />
        <Route path="/arquivos" element={<ProtectedRoute><ArquivosPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    event.preventDefault();
  });
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CommandPalette />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
