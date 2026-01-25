import { Navigate } from 'react-router-dom';

// Redirecionar para o Dashboard Financeiro
export default function Financial() {
  return <Navigate to="/financeiro/dashboard" replace />;
}
