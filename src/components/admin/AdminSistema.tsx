import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '../../shared/utils/apiFetch';
import { AdminSistemaFeedbackToast } from './AdminSistemaFeedbackToast';
import { AdminSistemaIdentityCard } from './AdminSistemaIdentityCard';
import { AdminSistemaSmtpCard } from './AdminSistemaSmtpCard';
import { AdminSistemaSessionCard } from './AdminSistemaSessionCard';
import { AdminSistemaBackupCard } from './AdminSistemaBackupCard';

export function AdminSistema() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; type: 'success' | 'error'; msg: string } | null>(null);

  // Identity form state
  const [identityForm, setIdentityForm] = useState({ name: '', cnpj: '', address: '', email: '', phone: '' });

  // SMTP form state
  const [smtpForm, setSmtpForm] = useState({ host: 'smtp.sendgrid.net', port: 587, user: '', pass: '', from_name: 'KennelManager Pro', from_email: 'noreply@kennelmanager.com' });

  // Session form state
  const [sessionForm, setSessionForm] = useState({ timeout_minutes: 30, max_login_attempts: 5, lockout_duration_minutes: 15 });

  // Fetch configs on mount
  useEffect(() => {
    apiFetch('/system-config')
      .then(res => {
        if (res.success) {
          const map: Record<string, any> = {};
          (res.data || []).forEach((c: any) => { map[c.key] = c.value; });
          setConfigs(map);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Populate form states when configs load
  useEffect(() => {
    if (configs['kennel_identity']) {
      setIdentityForm(prev => ({ ...prev, ...configs['kennel_identity'] }));
    }
    if (configs['smtp_config']) {
      setSmtpForm(prev => ({ ...prev, ...configs['smtp_config'] }));
    }
    if (configs['session_config']) {
      setSessionForm(prev => ({ ...prev, ...configs['session_config'] }));
    }
  }, [configs]);

  const saveConfig = async (key: string, value: any, description?: string) => {
    setSaving(key);
    setFeedback(null);
    try {
      const json = await apiFetch(`/system-config/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, description }),
      });
      if (json.success) {
        setFeedback({ key, type: 'success', msg: 'Configuração salva com sucesso!' });
        setConfigs(prev => ({ ...prev, [key]: value }));
      } else {
        setFeedback({ key, type: 'error', msg: json.message || 'Erro ao salvar' });
      }
    } catch {
      setFeedback({ key, type: 'error', msg: 'Erro de conexão' });
    } finally {
      setSaving(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10 relative">

      {/* Feedback toast */}
      <AdminSistemaFeedbackToast feedback={feedback} />

      {/* Bloco 1: Identidade */}
      <AdminSistemaIdentityCard
        form={identityForm}
        onChange={(updates) => setIdentityForm(prev => ({ ...prev, ...updates }))}
        saving={saving === 'kennel_identity'}
        onSave={() => saveConfig('kennel_identity', identityForm, 'Identidade do canil')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Bloco 2: E-mail e SMTP */}
        <AdminSistemaSmtpCard
          form={smtpForm}
          onChange={(updates) => setSmtpForm(prev => ({ ...prev, ...updates }))}
          saving={saving === 'smtp_config'}
          onSave={() => saveConfig('smtp_config', smtpForm, 'Configuração de email SMTP')}
        />

        {/* Bloco 3: Sessão e Segurança */}
        <AdminSistemaSessionCard
          form={sessionForm}
          onChange={(updates) => setSessionForm(prev => ({ ...prev, ...updates }))}
          saving={saving === 'session_config'}
          onSave={() => saveConfig('session_config', sessionForm, 'Configurações de sessão e segurança')}
        />
      </div>

      {/* Bloco 4: Backup e Manutenção Crítica */}
      <AdminSistemaBackupCard />

    </div>
  );
}
