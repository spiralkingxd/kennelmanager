import React, { useState, useEffect } from 'react';
import { Modal } from '../plantel/modals/Modal';
import { FormField } from '../plantel/modals/FormFields';
import { ClientSearch } from './ClientSearch';
import { apiFetch } from '../../shared/utils/apiFetch';
import type { Puppy, ClientOption } from './types';

interface ReservarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  puppy: Puppy | null;
}

export function ReservarModal({ isOpen, onClose, onSaved, puppy }: ReservarModalProps) {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      setClientId('');
      setAmount(puppy?.price ? String(puppy.price) : '');
      setError(null);
      setFieldError(null);
      apiFetch('/clients?limit=1000')
        .then((res) => { if (res.success) setClients(res.data); })
        .catch(() => {});
    }
  }, [isOpen, puppy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (!clientId) {
      setFieldError('Selecione um cliente');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setFieldError('Informe um valor de reserva válido');
      return;
    }

    setSaving(true);
    try {
      // 1. Atualizar status do filhote para RESERVED + vincular cliente
      const puppyJson = await apiFetch(`/puppies/${puppy!.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'RESERVED', clientId }),
      });
      if (!puppyJson.success) {
        setError(puppyJson.message || 'Erro ao reservar filhote');
        setSaving(false);
        return;
      }

      // 2. Criar venda PENDING com o valor de entrada (reserva)
      const saleJson = await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          puppyId: puppy!.id,
          status: 'PENDING',
          condition: 'CASH',
          entryValue: parseFloat(amount),
        }),
      });
      if (!saleJson.success) {
        setError(saleJson.message || 'Erro ao registrar reserva');
        setSaving(false);
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError('Erro de conexão ao servidor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reservar ${puppy?.name || puppy?.color || 'Filhote'}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="md:col-span-2">
            <ClientSearch
              label="Cliente *"
              placeholder="Selecione o cliente..."
              value={clientId}
              onChange={(id) => { setClientId(id); setFieldError(null); }}
              clients={clients}
            />
            {fieldError && !clientId && (
              <p className="text-red-400 text-xs mt-1">{fieldError}</p>
            )}
          </div>

          <FormField
            label="Valor da Reserva (R$) *"
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setFieldError(null); }}
            step="0.01"
            placeholder="Ex: 500.00"
          />
          {fieldError && clientId && (
            <p className="text-red-400 text-xs -mt-2">{fieldError}</p>
          )}

          {puppy?.price && (
            <p className="text-xs text-zinc-500">
              Preço do filhote: <span className="text-zinc-300 font-medium">R$ {Number(puppy.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-amber-950 hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-amber-950/30 border-t-amber-950 rounded-full animate-spin" /> Reservando...</>
            ) : 'Confirmar Reserva'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
