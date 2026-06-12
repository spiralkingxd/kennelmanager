import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ClientesList } from './ClientesList';
import { ClienteProfile } from './ClienteProfile';
import { ClienteBulkDeleteModal } from './ClienteBulkDeleteModal';
import { ClienteDeleteModal } from './ClienteDeleteModal';
import { ClienteModal } from './ClienteModal';

export function ClientesManager() {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const handleBulkDeleteSuccess = () => {
    setShowBulkDelete(false);
    setSelectedIds(new Set());
    setRefreshKey(k => k + 1);
  };

  const onToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (selectedClienteId) {
    return (
      <>
        <ClienteProfile
          clienteId={selectedClienteId}
          onBack={() => setSelectedClienteId(null)}
          onDelete={(name) => setDeleteTarget({ id: selectedClienteId, name })}
        />
        <ClienteDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          clienteId={deleteTarget?.id || ''}
          clienteName={deleteTarget?.name || ''}
          onDeleted={() => {
            setDeleteTarget(null);
            setSelectedClienteId(null);
            setRefreshKey(k => k + 1);
          }}
        />
      </>
    );
  }

  return (
    <>
      {showBulkDelete && (
        <ClienteBulkDeleteModal
          ids={Array.from(selectedIds)}
          onClose={() => setShowBulkDelete(false)}
          onSuccess={handleBulkDeleteSuccess}
        />
      )}

      <ClienteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaved={() => {
          setShowCreateModal(false);
          setRefreshKey(k => k + 1);
        }}
        cliente={null}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Clientes</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Gerencie todos os clientes do canil</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkDelete(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-all"
              >
                <Trash2 size={18} />
                Excluir Selecionados ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
            >
              <Plus size={18} />
              Novo Cliente
            </button>
          </div>
        </div>

        <ClientesList
          refreshKey={refreshKey}
          onSelectCliente={setSelectedClienteId}
          onDeleteCliente={(id, name) => setDeleteTarget({ id, name })}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>

      <ClienteDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        clienteId={deleteTarget?.id || ''}
        clienteName={deleteTarget?.name || ''}
        onDeleted={() => {
          setDeleteTarget(null);
          setRefreshKey(k => k + 1);
        }}
      />
    </>
  );
}
