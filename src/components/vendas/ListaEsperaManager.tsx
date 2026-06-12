import React, { useState, useEffect, useCallback } from 'react';
import { WaitlistModal } from './WaitlistModal';
import { WaitlistHeader } from './WaitlistHeader';
import { WaitlistStats } from './WaitlistStats';
import { WaitlistSearchFilter } from './WaitlistSearchFilter';
import { WaitlistLoadingState } from './WaitlistLoadingState';
import { WaitlistErrorState } from './WaitlistErrorState';
import { WaitlistEmptyState } from './WaitlistEmptyState';
import { WaitlistTable } from './WaitlistTable';
import { MatchData, WaitlistEntry } from './types';
import { apiFetch } from '../../shared/utils/apiFetch';

export function ListaEsperaManager() {
  const [data, setData] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);
  const [matches, setMatches] = useState<Record<string, MatchData[]>>({});
  const [loadingMatch, setLoadingMatch] = useState<string | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/waitlist');
      if (json.success) setData(json.data);
      else setError(json.message || 'Erro ao carregar dados');
    } catch {
      setError('Erro de conexão ao servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const findMatches = async (id: string) => {
    setLoadingMatch(id);
    try {
      const json = await apiFetch(`/waitlist/${id}/matches`);
      if (json.success) {
        setMatches(prev => ({ ...prev, [id]: json.data }));
        setExpandedMatch(expandedMatch === id ? null : id);
      }
    } catch {
      // silent
    } finally {
      setLoadingMatch(null);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
    const json = await apiFetch(`/waitlist/${id}`, { method: 'DELETE' });
    if (json.success) fetchData();
  };

  const handleEdit = (entry: WaitlistEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchData();
    setEditingEntry(null);
    setMatches({});
  };

  const filtered = data.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (item.client_name || '').toLowerCase().includes(q) ||
      (item.preferred_breed || '').toLowerCase().includes(q) ||
      (item.notes || '').toLowerCase().includes(q)
    );
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = data.filter(i => i.status === 'ACTIVE').length;
  const matchedCount = data.filter(i => i.status === 'MATCHED').length;

  return (
    <div className="space-y-6">
      <WaitlistHeader onNew={handleNew} />

      <WaitlistStats total={data.length} activeCount={activeCount} matchedCount={matchedCount} />

      <WaitlistSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {loading && <WaitlistLoadingState />}

      {error && !loading && <WaitlistErrorState error={error} onRetry={fetchData} />}

      {!loading && !error && filtered.length === 0 && <WaitlistEmptyState onAddFirst={handleNew} />}

      {!loading && !error && filtered.length > 0 && (
        <WaitlistTable
          items={filtered}
          matches={matches}
          expandedMatch={expandedMatch}
          loadingMatch={loadingMatch}
          onFindMatches={findMatches}
          onEdit={handleEdit}
          onDelete={deleteEntry}
        />
      )}

      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null); }}
        onSaved={handleSaved}
        entry={editingEntry}
      />
    </div>
  );
}
