import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Dog, Baby, Users, TrendingUp, DollarSign, 
  HeartPulse, Settings, RefreshCw, AlertTriangle,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';

import { KpiCard } from './KpiCard';
import { apiFetch } from '../../shared/utils/apiFetch';
import { FinanceChart } from './FinanceChart';
import { SalesChart } from './SalesChart';
import { PuppiesStatus } from './PuppiesStatus';
import { ReproductionStatus } from './ReproductionStatus';
import { AlarmsPanel } from './AlarmsPanel';
import { AgendaPanel } from './AgendaPanel';
import { ActivityPanel } from './ActivityPanel';
import {
  MONTHS,
  formatCurrency,
  getMonthKey,
  currentMonthKey,
  previousMonthKey,
  calcChange,
} from './utils';

interface DashboardProps {
  navigateTo?: (id: string) => void;
  user?: { id: string; username: string; role: string; name?: string } | null;
}

export function Dashboard({ navigateTo, user }: DashboardProps) {
  const [greeting, setGreeting] = useState('Olá');
  const [currentDate, setCurrentDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState({
    finance: true,
    sales: true,
    puppies: true,
    reproduction: true,
    activity: true
  });

  // ─── Dashboard data state ────────────────────────────────────────────────────
  const [animalsCount, setAnimalsCount] = useState(0);
  const [femalesCount, setFemalesCount] = useState(0);
  const [puppiesAvailable, setPuppiesAvailable] = useState(0);
  const [littersActive, setLittersActive] = useState(0);
  const [littersRecent, setLittersRecent] = useState<any[]>([]);
  const [waitlistActive, setWaitlistActive] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [prevMonthIncome, setPrevMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [prevMonthExpense, setPrevMonthExpense] = useState(0);
  const [financeChartData, setFinanceChartData] = useState<any[]>([]);
  const [activePuppies, setActivePuppies] = useState<any[]>([]);
  const [puppiesSoldYear, setPuppiesSoldYear] = useState(0);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // ─── Greeting + Date ─────────────────────────────────────────────────────────
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDate = formatter.format(new Date());
    setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
  }, []);

  // ─── Fetch all dashboard data ────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [animalsRes, puppiesRes, littersRes, waitlistRes, financialRes, healthRes, calendarRes, auditRes] = await Promise.all([
        apiFetch('/animals?limit=100'),
        apiFetch('/puppies'),
        apiFetch('/litters'),
        apiFetch('/waitlist'),
        apiFetch('/financial'),
        apiFetch('/health/overview'),
        apiFetch('/calendar'),
        apiFetch('/audit?page=1&limit=5'),
      ]);

      const currentYear = new Date().getFullYear();

      // ─── KPI: Cães no Plantel + Fêmeas ───────────────────────────────────
      if (animalsRes.success) {
        const allAnimals = animalsRes.data || [];
        setAnimalsCount(allAnimals.length);
        setFemalesCount(allAnimals.filter((a: any) => a.sex === 'FEMALE').length);
      }

      // ─── KPI: Filhotes Disponíveis + Active Puppies ──────────────────────
      if (puppiesRes.success) {
        const allPuppies = puppiesRes.data || [];
        const available = allPuppies.filter((p: any) => p.status === 'AVAILABLE');
        setPuppiesAvailable(available.length);

        const mapped = allPuppies
          .filter((p: any) => p.status === 'AVAILABLE' || p.status === 'RESERVED')
          .slice(0, 8)
          .map((p: any) => ({
            id: p.id,
            code: p.name || p.color || p.id?.slice(0, 8) || 'Filhote',
            status: p.status === 'AVAILABLE' ? 'Disponível' : p.status === 'RESERVED' ? 'Reservado' : p.status,
            sexLabel: p.sex === 'MALE' ? 'Macho' : 'Fêmea',
            age: p.birth_date ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (1000 * 60 * 60 * 24)) + ' dias' : '—',
            color: p.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          }));
        setActivePuppies(mapped);

        // ─── Sales: Filhotes Vendidos (Ano) ──────────────────────────────
        // Computa vendas do ano a partir das transações financeiras PAID
        // (usa "Venda #" no description para identificar transações de venda)
        const salesByMonth: Record<string, number> = {};
        for (let i = 0; i < 12; i++) {
          salesByMonth[`${currentYear}-${String(i + 1).padStart(2, '0')}`] = 0;
        }
        let soldCount = 0;
        if (financialRes.success) {
          (financialRes.data || []).forEach((f: any) => {
            if (f.type === 'INCOME' && f.status === 'PAID' && f.description?.startsWith('Venda #')) {
              const mk = getMonthKey(f.date);
              if (salesByMonth[mk] !== undefined) {
                salesByMonth[mk]++;
                soldCount++;
              }
            }
          });
        }
        setPuppiesSoldYear(soldCount);
        setSalesChartData(
          MONTHS.map((name, i) => ({
            name,
            vendas: salesByMonth[`${currentYear}-${String(i + 1).padStart(2, '0')}`] || 0,
          }))
        );
      }

      // ─── Ninhadas ────────────────────────────────────────────────────────
      if (littersRes.success) {
        const allLitters = littersRes.data || [];
        setLittersActive(allLitters.filter((l: any) => l.status === 'ACTIVE').length);
        // Recent litters (last 60 days)
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const recent = allLitters.filter((l: any) => l.birth_date && new Date(l.birth_date) >= sixtyDaysAgo);
        setLittersRecent(recent.slice(0, 5));
      }

      // ─── KPI: Lista de Espera ───────────────────────────────────────────
      if (waitlistRes.success) {
        const allWaitlist = waitlistRes.data || [];
        setWaitlistActive(allWaitlist.filter((w: any) => w.status === 'ACTIVE').length);
      }

      // ─── Financial KPIs + Chart + Comparison ────────────────────────────
      if (financialRes.success) {
        const allFinancial = financialRes.data || [];
        const monthKey = currentMonthKey();
        const prevKey = previousMonthKey();

        const byMonth: Record<string, { income: number; expense: number }> = {};
        for (let i = 0; i < 12; i++) {
          byMonth[`${currentYear}-${String(i + 1).padStart(2, '0')}`] = { income: 0, expense: 0 };
        }

        allFinancial.forEach((f: any) => {
          if (f.status !== 'PAID') return;
          const mk = getMonthKey(f.date);
          if (byMonth[mk]) {
            if (f.type === 'INCOME') byMonth[mk].income += Number(f.amount) || 0;
            else if (f.type === 'EXPENSE') byMonth[mk].expense += Number(f.amount) || 0;
          }
        });

        setMonthIncome(byMonth[monthKey]?.income || 0);
        setMonthExpense(byMonth[monthKey]?.expense || 0);
        setPrevMonthIncome(byMonth[prevKey]?.income || 0);
        setPrevMonthExpense(byMonth[prevKey]?.expense || 0);

        setFinanceChartData(
          MONTHS.map((name, i) => ({
            name,
            receitas: byMonth[`${currentYear}-${String(i + 1).padStart(2, '0')}`]?.income || 0,
            custos: byMonth[`${currentYear}-${String(i + 1).padStart(2, '0')}`]?.expense || 0,
          }))
        );
      }

      // ─── Alarms / Health Overview ───────────────────────────────────────
      if (healthRes.success) {
        const overview = healthRes.data || {};
        const healthAlarms: any[] = [];

        (overview.upcomingVaccines || []).forEach((v: any) => {
          healthAlarms.push({
            id: `vac-${v.id}`, category: 'saude',
            title: 'Vacina Pendente',
            desc: `${v.animal_name || 'Animal'} — ${v.vaccine_name || v.vaccine_type || 'Vacina'} vence em breve`,
          });
        });
        (overview.upcomingDeworming || []).forEach((d: any) => {
          healthAlarms.push({
            id: `dew-${d.id}`, category: 'saude',
            title: 'Vermifugação Pendente',
            desc: `${d.animal_name || 'Animal'} — próxima dose em breve`,
          });
        });
        (overview.activeMedications || []).forEach((m: any) => {
          healthAlarms.push({
            id: `med-${m.id}`, category: 'saude',
            title: 'Medicação em Andamento',
            desc: `${m.animal_name || 'Animal'} — ${m.medication_name || m.medication}`,
          });
        });

        setAlarms(healthAlarms.slice(0, 5));
      }

      // ─── Agenda ─────────────────────────────────────────────────────────
      if (calendarRes.success) {
        const events = calendarRes.data || [];
        const now = new Date();
        const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setAgendaEvents(events.filter((e: any) => {
          const eventDate = new Date(e.date);
          return eventDate >= now && eventDate <= sevenDays;
        }));
      }

      // ─── Recent Activity (Audit Log) ────────────────────────────────────
      if (auditRes.success) {
        setRecentActivity((auditRes.data || []).slice(0, 5));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard();
  };

  const toggleSection = (key: string) => {
    setVisibleSections(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  // ─── KPI definitions with real data + comparisons ───────────────────────────
  const monthProfit = monthIncome - monthExpense;
  const prevMonthProfit = prevMonthIncome - prevMonthExpense;
  const incomeChange = calcChange(monthIncome, prevMonthIncome);
  const expenseChange = calcChange(monthExpense, prevMonthExpense);
  const profitChange = calcChange(monthProfit, prevMonthProfit);

  const kpis = [
    { id: 'plantel', title: 'Cães no Plantel', value: String(animalsCount), change: '-', percent: '-', trend: 'neutral' as const, icon: Dog, color: 'text-brand-500' },
    { id: 'filhotes', title: 'Filhotes Disponíveis', value: String(puppiesAvailable), change: '-', percent: '-', trend: 'neutral' as const, icon: Baby, color: 'text-blue-500' },
    { id: 'ninhadas', title: 'Ninhadas Ativas', value: String(littersActive), change: '-', percent: '-', trend: 'neutral' as const, icon: HeartPulse, color: 'text-purple-500' },
    { id: 'espera', title: 'Lista de Espera', value: String(waitlistActive), change: '-', percent: '-', trend: 'neutral' as const, icon: Users, color: 'text-emerald-500' },
    { id: 'receita', title: 'Receita (Mês)', value: formatCurrency(monthIncome), change: incomeChange.change, percent: incomeChange.percent, trend: incomeChange.trend, icon: TrendingUp, color: 'text-amber-500' },
    { id: 'resultado', title: 'Resultado (Mês)', value: formatCurrency(monthProfit), change: profitChange.change, percent: profitChange.percent, trend: profitChange.trend, icon: DollarSign, color: 'text-emerald-500' },
  ];

  const yearIncome = financeChartData.reduce((acc, m) => acc + (m.receitas || 0), 0);
  const yearExpense = financeChartData.reduce((acc, m) => acc + (m.custos || 0), 0);
  const yearProfit = yearIncome - yearExpense;

  // Error state
  if (error) {
    return (
      <div className="pb-10 space-y-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pb-10 space-y-6">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {greeting}, <span className="text-brand-500">{user?.name || user?.username || 'Usuário'}</span>!
          </h1>
          <p className="text-sm font-medium text-zinc-400 mb-2 capitalize">{currentDate}</p>
          {alarms.length === 0 ? (
            <div role="status" className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 border border-brand-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span className="text-xs font-semibold text-brand-400">
                Nenhuma notificação urgente pendente.
              </span>
            </div>
          ) : (
            <div role="alert" className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">
                {alarms.length} {alarms.length === 1 ? 'pendência' : 'pendências'} de saúde
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            aria-label={isEditMode ? 'Concluir edição do painel' : 'Personalizar painel'}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all border ${
              isEditMode ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Settings size={18} /> {isEditMode ? 'Concluir Edição' : 'Personalizar'}
          </button>
          
          <button 
            onClick={handleRefresh}
            aria-label="Atualizar dados do dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
            title="Atualizar Dados"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-brand-500' : ''} />
          </button>
        </div>
      </div>

      {/* Edit Mode Toggles */}
      {isEditMode && (
        <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
          <p className="text-xs font-semibold text-brand-400 mb-3 flex items-center gap-2">
            <Eye size={14} /> Personalizar seções visíveis no dashboard:
          </p>
          <div className="flex flex-wrap gap-3">
            {([
              { key: 'finance', label: 'Situação Financeira' },
              { key: 'sales', label: 'Desempenho de Vendas' },
              { key: 'puppies', label: 'Disponibilidade' },
              { key: 'reproduction', label: 'Situação Reprodutiva' },
              { key: 'activity', label: 'Atividade Recente' },
            ] as const).map(s => (
              <label key={s.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(visibleSections as any)[s.key]}
                  onChange={() => toggleSection(s.key)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                  {(visibleSections as any)[s.key] ? <Eye size={14} className="inline mr-1 text-brand-400" /> : <EyeOff size={14} className="inline mr-1 text-zinc-500" />}
                  {s.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Fragment key={kpi.id}>
            <KpiCard title={kpi.title} value={kpi.value} change={kpi.change} percent={kpi.percent} trend={kpi.trend} icon={kpi.icon} color={kpi.color} />
          </Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COLUNA PRINCIPAL (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          
          {visibleSections.finance && (
            <FinanceChart data={financeChartData} yearIncome={yearIncome} yearExpense={yearExpense} yearProfit={yearProfit} />
          )}

          {visibleSections.puppies && (
            <PuppiesStatus puppies={activePuppies} puppiesAvailable={puppiesAvailable} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {visibleSections.sales && (
              <SalesChart data={salesChartData} puppiesSoldYear={puppiesSoldYear} monthIncome={monthIncome} />
            )}

            {visibleSections.reproduction && (
              <ReproductionStatus
                femalesCount={femalesCount}
                littersActive={littersActive}
                littersRecent={littersRecent}
                navigateTo={navigateTo}
              />
            )}
          </div>
        </div>

        {/* COLUNA LATERAL DIREITA (1/3) */}
        <div className="space-y-6">
          
          <AlarmsPanel alarms={alarms} />

          <AgendaPanel events={agendaEvents} navigateTo={navigateTo} />

          {visibleSections.activity && (
            <ActivityPanel activities={recentActivity} navigateTo={navigateTo} />
          )}

        </div>
      </div>
    </div>
  );
}
