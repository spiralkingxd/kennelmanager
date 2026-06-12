import React, { useState, useEffect } from 'react';
import { Database, Mail, Activity, Users, Dog, ShoppingCart, Baby } from 'lucide-react';
import { apiFetch } from '../../shared/utils/apiFetch';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function AdminVisaoGeral() {
  const [stats, setStats] = useState({ animals: 0, clients: 0, sales: 0, litters: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      apiFetch('/animals?page=1&limit=1'),
      apiFetch('/clients?page=1&limit=1'),
      apiFetch('/financial?page=1&limit=100'),
      apiFetch('/litters?page=1&limit=1'),
      apiFetch('/users?page=1&limit=1'),
    ])
      .then(([animalsRes, clientsRes, financialRes, littersRes, usersRes]) => {
        setStats({
          animals: animalsRes.meta?.total || animalsRes.data?.length || 0,
          clients: clientsRes.meta?.total || clientsRes.data?.length || 0,
          sales:
            financialRes.data?.filter(
              (t: any) => t.type === 'INCOME' && t.status === 'PAID',
            ).length || 0,
          litters: littersRes.meta?.total || littersRes.data?.length || 0,
          users: usersRes.meta?.total || usersRes.data?.length || 0,
        });
      })
      .catch(console.error);
  }, []);

  const chartData = [
    { name: '1', acoes: 120 },
    { name: '5', acoes: 210 },
    { name: '10', acoes: 180 },
    { name: '15', acoes: 350 },
    { name: '20', acoes: 290 },
    { name: '25', acoes: 410 },
    { name: '30', acoes: 380 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 transform-gpu">
      {/* Indicadores de Banco e Uso */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Animais', value: String(stats.animals), icon: Dog, color: 'text-amber-500' },
          { label: 'Clientes', value: String(stats.clients), icon: Users, color: 'text-blue-500' },
          {
            label: 'Vendas',
            value: String(stats.sales),
            icon: ShoppingCart,
            color: 'text-emerald-500',
          },
          { label: 'Ninhadas', value: String(stats.litters), icon: Baby, color: 'text-fuchsia-500' },
          { label: 'Usuários', value: String(stats.users), icon: Users, color: 'text-brand-500' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 relative overflow-hidden group"
            >
              <Icon
                size={48}
                className={`absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-10 transition-opacity ${item.color}`}
              />
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={item.color} />
                <span className="text-xs font-semibold text-zinc-400">{item.label}</span>
              </div>
              <p className="text-2xl font-black text-white">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-brand-500" />
            Atividade do Sistema (Últimos 30 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="acoes"
                  name="Ações"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorAcoes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status de Serviço */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col">
          <h3 className="font-bold text-white mb-4">Status dos Serviços</h3>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-800/20">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-zinc-400" />
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Banco de Dados</p>
                  <p className="text-[10px] text-zinc-500">PostgreSQL (Replicado)</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>{' '}
                Operacional
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-800/20">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-zinc-400" />
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Serviço de E-mail</p>
                  <p className="text-[10px] text-zinc-500">SMTP SendGrid</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>{' '}
                Operacional
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              Último backup automático:{' '}
              <span className="font-semibold text-zinc-400">Hoje às 03:00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
