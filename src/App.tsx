import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Sidebar, menuGroups } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/dashboard';
import { NinhadasManager } from './components/ninhadas/NinhadasManager';
import { ListaEsperaManager } from './components/vendas/ListaEsperaManager';
import { RegistroVendasManager } from './components/vendas/RegistroVendasManager';
import { FilhotesStatusManager } from './components/vendas/FilhotesStatusManager';
import { CustosManager } from './components/vendas/CustosManager';
import { RelatoriosManager } from './components/vendas/RelatoriosManager';
import { AuthManager } from './components/auth/AuthManager';
import { CalendarioManager } from './components/calendario/CalendarioManager';
import { useAuth } from './hooks/useAuth';

// Lazy imports para code splitting - componentes pesados
const PlantelManager = lazy(() => import('./components/plantel/PlantelManager').then(m => ({ default: m.PlantelManager })));
const ClientesManager = lazy(() => import('./components/clientes/ClientesManager').then(m => ({ default: m.ClientesManager })));
const SaudeManager = lazy(() => import('./components/saude/SaudeManager').then(m => ({ default: m.SaudeManager })));
const ReproducaoManager = lazy(() => import('./components/reproducao/ReproducaoManager').then(m => ({ default: m.ReproducaoManager })));
const FinanceiroManager = lazy(() => import('./components/vendas/FinanceiroManager').then(m => ({ default: m.FinanceiroManager })));
const AdminManager = lazy(() => import('./components/admin/AdminManager').then(m => ({ default: m.AdminManager })));

// Loader discreto para componentes em lazy loading
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();

  // ─── URL-based routing ───────────────────────────────────────────────────
  const pathToId = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'dashboard';
  };

  const [activeItemId, setActiveItemId] = useState(() => pathToId(window.location.pathname));

  // Sync state when URL changes via browser back/forward
  useEffect(() => {
    const handlePopState = () => setActiveItemId(pathToId(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((id: string) => {
    const path = `/${id}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setActiveItemId(id);
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigateTo('dashboard');
  };

  // Proteção: redireciona não-admins que tentarem acessar /admin diretamente
  // Este useEffect DEVE ser chamado em TODAS as renderizações para manter a ordem dos hooks consistente
  useEffect(() => {
    if (activeItemId === 'admin' && user?.role !== 'ADMIN') {
      navigateTo('dashboard');
    }
  }, [activeItemId, user?.role, navigateTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthManager onLogin={(token, userData, refreshToken) => login(token, userData, refreshToken)} />;
  }

  // Encontra o item ativo e seu grupo para passar para o Header
  let activeGroupTitle = '';
  let activeItemLabel = '';

  for (const group of menuGroups) {
    const item = group.items.find((i) => i.id === activeItemId);
    if (item) {
      activeGroupTitle = group.title;
      activeItemLabel = item.label;
      break;
    }
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-brand-500 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
        Ir para o conteúdo
      </a>
      <div className="flex h-screen w-full bg-zinc-950 font-sans text-zinc-100 overflow-hidden">
        <Sidebar
          activeItemId={activeItemId}
          setActiveItemId={navigateTo}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onLogout={handleLogout}
          user={user}
        />
        
        <div className="flex flex-1 flex-col min-w-0">
          <Header 
            activeGroupTitle={activeGroupTitle} 
            activeItemLabel={activeItemLabel} 
          />
          
          <main id="main-content" className="flex-1 overflow-auto px-2 md:px-3 lg:px-4 py-4 md:py-5 lg:py-6 relative">
            {activeItemId === 'dashboard' ? (
              <Dashboard navigateTo={navigateTo} user={user} />
            ) : activeItemId === 'calendario' ? (
              <CalendarioManager />
            ) : activeItemId === 'plantel' ? (
              <Suspense fallback={<ComponentLoader />}><PlantelManager /></Suspense>
            ) : activeItemId === 'clientes' ? (
              <Suspense fallback={<ComponentLoader />}><ClientesManager /></Suspense>
            ) : activeItemId === 'saude' ? (
              <Suspense fallback={<ComponentLoader />}><SaudeManager /></Suspense>
            ) : activeItemId === 'reproducao' ? (
              <Suspense fallback={<ComponentLoader />}><ReproducaoManager /></Suspense>
            ) : activeItemId === 'ninhadas' ? (
              <NinhadasManager />
            ) : activeItemId === 'vendas' ? (
              <RegistroVendasManager />
            ) : activeItemId === 'espera' ? (
              <ListaEsperaManager />
            ) : activeItemId === 'filhotes' ? (
              <FilhotesStatusManager />
            ) : activeItemId === 'financeiro' ? (
              <Suspense fallback={<ComponentLoader />}><FinanceiroManager /></Suspense>
            ) : activeItemId === 'custos' ? (
              <CustosManager />
            ) : activeItemId === 'relatorios' ? (
              <RelatoriosManager />
            ) : activeItemId === 'admin' && user?.role === 'ADMIN' ? (
              <Suspense fallback={<ComponentLoader />}><AdminManager /></Suspense>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <p className="mb-2 text-lg font-medium text-zinc-400">Em Desenvolvimento</p>
                <p className="text-sm text-center max-w-sm">
                  A tela de <strong className="text-zinc-300">{activeItemLabel}</strong> está sendo construída.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
