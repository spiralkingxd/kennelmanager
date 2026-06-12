import { useState, useEffect } from 'react';
import React from 'react';
import { ChevronLeft, LayoutGrid, Receipt } from 'lucide-react';
import { NinhadaProfileProps } from './NinhadaProfile.types';
import { NinhadaProfileHeader } from './NinhadaProfileHeader';
import { PuppyStatsCards } from './PuppyStatsCards';
import { PuppyListCard } from './PuppyListCard';
import { NinhadaTimeline } from './NinhadaTimeline';
import { DeleteLitterModal } from './DeleteLitterModal';
import { LitterModal } from './modals/LitterModal';
import { PuppyModal } from './modals/PuppyModal';
import { LitterExpensesTab } from './tabs/LitterExpensesTab';
import { apiFetch } from '../../shared/utils/apiFetch';

export function NinhadaProfile({ ninhadaId, onBack }: NinhadaProfileProps) {
  const [litter, setLitter] = useState<any>(null);
  const [puppies, setPuppies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [litterModalOpen, setLitterModalOpen] = useState(false);
  const [puppyModalOpen, setPuppyModalOpen] = useState(false);
  const [editingPuppy, setEditingPuppy] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const json = await apiFetch(`/litters/${ninhadaId}`, { method: 'DELETE' });
      if (json.success) {
        onBack();
      } else {
        alert(json.message || 'Erro ao excluir ninhada');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const fetchLitter = async () => {
    try {
      const json = await apiFetch(`/litters/${ninhadaId}`);
      if (json.success) {
        setLitter(json.data);
      } else {
        setError('Erro ao carregar dados da ninhada');
      }
    } catch {
      setError('Erro de conexão ao carregar ninhada');
    }
  };

  const fetchPuppies = async () => {
    try {
      const json = await apiFetch(`/puppies?litterId=${ninhadaId}`);
      if (json.success) {
        setPuppies(json.data);
      } else {
        setError('Erro ao carregar filhotes');
      }
    } catch {
      setError('Erro de conexão ao carregar filhotes');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchLitter(), fetchPuppies()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [ninhadaId]);

  const handleDeletePuppy = async (puppyId: string, puppyName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o filhote "${puppyName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      const json = await apiFetch(`/puppies/${puppyId}`, { method: 'DELETE' });
      if (json.success) {
        fetchPuppies();
      } else {
        alert('Erro ao excluir filhote');
      }
    } catch {
      alert('Erro de conexão ao excluir filhote');
    }
  };

  const stats = {
    total: puppies.length,
    available: puppies.filter(p => p.status === 'AVAILABLE').length,
    reserved: puppies.filter(p => p.status === 'RESERVED').length,
    sold: puppies.filter(p => p.status === 'SOLD').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-brand-500" />
            <p className="text-sm font-medium text-zinc-400">Carregando ninhada...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !litter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="mb-2 text-lg font-semibold text-red-400">Erro ao carregar</p>
          <p className="mb-4 text-sm text-zinc-400">{error}</p>
          <button
            onClick={fetchAll}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!litter) return null;

  const litterName = `Ninhada de ${litter.mother_name} & ${litter.father_name}`;

  return (
    <div className="space-y-6">

      <NinhadaProfileHeader
        onBack={onBack}
        litter={litter}
        onEdit={() => setLitterModalOpen(true)}
        onDelete={() => setDeleteModalOpen(true)}
      />

      <nav className="flex border-b border-zinc-800 mb-4">
        {[
          { id: 'overview', label: 'Visão Geral', icon: LayoutGrid },
          { id: 'expenses', label: 'Custos', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'expenses')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

           <div className="xl:col-span-2 space-y-6">

              <PuppyStatsCards
                total={stats.total}
                available={stats.available}
                reserved={stats.reserved}
                sold={stats.sold}
              />

              <PuppyListCard
                puppies={puppies}
                onEditPuppy={(pup) => { setEditingPuppy(pup); setPuppyModalOpen(true); }}
                onDeletePuppy={handleDeletePuppy}
              />
           </div>

           <div className="xl:col-span-1 space-y-6">
              <NinhadaTimeline litter={litter} />
           </div>

        </div>
      )}

      {activeTab === 'expenses' && <LitterExpensesTab litterId={ninhadaId} />}

      <DeleteLitterModal
        isOpen={deleteModalOpen}
        deleting={deleting}
        litterName={litterName}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      <LitterModal
        isOpen={litterModalOpen}
        onClose={() => setLitterModalOpen(false)}
        onSaved={fetchAll}
        litter={litter}
      />
      <PuppyModal
        isOpen={puppyModalOpen}
        onClose={() => { setPuppyModalOpen(false); setEditingPuppy(null); }}
        onSaved={fetchPuppies}
        litterId={ninhadaId}
        puppy={editingPuppy}
      />
    </div>
  );
}
