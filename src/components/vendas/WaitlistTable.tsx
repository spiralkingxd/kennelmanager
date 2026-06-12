import React from 'react';
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { MatchData, WaitlistEntry } from './types';
import { formatCurrency, formatDate, WAITLIST_STATUS_LABEL, WAITLIST_STATUS_COLOR } from './constants';

interface WaitlistTableProps {
  items: WaitlistEntry[];
  matches: Record<string, MatchData[]>;
  expandedMatch: string | null;
  loadingMatch: string | null;
  onFindMatches: (id: string) => void;
  onEdit: (entry: WaitlistEntry) => void;
  onDelete: (id: string) => void;
}

export function WaitlistTable({
  items, matches, expandedMatch, loadingMatch,
  onFindMatches, onEdit, onDelete
}: WaitlistTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-300">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Cliente</th>
              <th className="px-4 py-3">Preferências</th>
              <th className="px-4 py-3">Orçamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {items.map((item) => {
              const isExpanded = expandedMatch === item.id;
              const matchData = matches[item.id];

              return (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-200">{item.client_name || 'Sem nome'}</span>
                        {item.client_phone && (
                          <span className="text-xs text-zinc-500">{item.client_phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.preferred_breed && (
                          <span className="bg-zinc-800 text-zinc-300 font-medium px-2 py-0.5 rounded text-xs">
                            {item.preferred_breed}
                          </span>
                        )}
                        {item.preferred_gender && (
                          <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">
                            {item.preferred_gender === 'MALE' ? 'Macho' : 'Fêmea'}
                          </span>
                        )}
                        {item.preferred_color && (
                          <span className="text-zinc-500 text-xs">{item.preferred_color}</span>
                        )}
                        {!item.preferred_breed && !item.preferred_gender && !item.preferred_color && (
                          <span className="text-zinc-600 italic">Sem preferências</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-emerald-400 font-medium">
                      {formatCurrency(item.max_price)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${WAITLIST_STATUS_COLOR[item.status] || 'bg-zinc-800 text-zinc-400'}`}>
                        {WAITLIST_STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onFindMatches(item.id)}
                          disabled={loadingMatch === item.id}
                          title="Encontrar Matches"
                          className="rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
                        >
                          {loadingMatch === item.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </button>
                        <button onClick={() => onEdit(item)}
                          title="Editar"
                          className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => onDelete(item.id)}
                          title="Excluir"
                          className="rounded-lg p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && matchData && (
                    <tr>
                      <td colSpan={6} className="px-4 pb-4">
                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={18} className="text-indigo-400" />
                            <span className="font-bold text-indigo-400">
                              {matchData.length} {matchData.length === 1 ? 'Match encontrado' : 'Matches encontrados'}
                            </span>
                          </div>

                          {matchData.length === 0 ? (
                            <p className="text-sm text-zinc-500">Nenhum filhote disponível corresponde às preferências no momento.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {matchData.map((m) => (
                                <div key={m.id}
                                  className="flex flex-col rounded-lg border border-zinc-700/60 bg-zinc-800/60 p-3 hover:border-zinc-600 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-zinc-200">{m.puppy_name}</span>
                                    <span className="text-xs text-zinc-500">{m.breed}</span>
                                  </div>
                                  <div className="flex gap-2 text-xs text-zinc-400">
                                    <span>{m.sex === 'MALE' ? 'Macho' : 'Fêmea'}</span>
                                    {m.color && <span>• {m.color}</span>}
                                  </div>
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                                    <span className="text-xs text-zinc-500">{m.litter_name}</span>
                                    <span className="font-semibold text-emerald-400">{formatCurrency(m.price)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
