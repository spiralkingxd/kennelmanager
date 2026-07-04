import React, { useState } from 'react';
import { Dog, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { usernameSchema, passwordSchema } from '../../shared/validation/schemas';
import { apiFetch } from '../../shared/utils/apiFetch';

interface AuthUser {
  id: string;
  username: string;
  role: string;
  name?: string;
}

interface AuthManagerProps {
  onLogin: (token: string, user: AuthUser, refreshToken?: string, rememberMe?: boolean) => void;
}

export function AuthManager({ onLogin }: AuthManagerProps) {
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Forgot Password State
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const usernameResult = usernameSchema.safeParse(username);
    const passwordResult = passwordSchema.safeParse(password);
    if (!usernameResult.success) {
      setFieldErrors(prev => ({ ...prev, username: usernameResult.error.issues[0].message }));
      return;
    }
    if (!passwordResult.success) {
      setFieldErrors(prev => ({ ...prev, password: passwordResult.error.issues[0].message }));
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (data.success) {
        const { token, refreshToken, user } = data.data || {};
        if (token && user) {
          onLogin(token, user, refreshToken, rememberMe);
        } else {
          setError('Resposta inválida do servidor (token ausente).');
        }
      } else {
        setError(data.message || 'Username ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const forgotResult = usernameSchema.safeParse(forgotUsername);
    if (!forgotResult.success) {
      setFieldErrors(prev => ({ ...prev, forgotUsername: forgotResult.error.issues[0].message }));
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username: forgotUsername }),
      });
      if (data.success) {
        setForgotSuccess(true);
      } else {
        setError(data.message || 'Erro ao solicitar recuperação de senha.');
      }
    } catch {
      setError('Erro de conexão ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 sm:p-6 lg:p-8">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-brand-500/5 blur-[128px]"></div>
        <div className="absolute right-[20%] bottom-[20%] h-96 w-96 rounded-full bg-purple-500/5 blur-[128px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl shadow-black backdrop-blur-xl">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 text-brand-500 mb-4 border border-brand-500/20 shadow-lg shadow-brand-500/10">
              <Dog size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Canil Manager
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              {view === 'login' ? 'Acesse sua conta para continuar' : 'Recuperar Acesso'}
            </p>
          </div>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    aria-label="Username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setFieldErrors(prev => ({...prev, username: ''})); }}
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                  />
                  {fieldErrors.username && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Senha"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: ''})); }}
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-11 pr-11 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm font-medium text-red-500 border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded border border-zinc-700 bg-zinc-900 group-hover:border-brand-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    {rememberMe && <div className="w-2 h-2 rounded-sm bg-brand-500" />}
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Manter-me conectado
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-sm font-semibold text-brand-500 hover:text-brand-400 hover:underline transition-all"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <div className="space-y-6">
              {!forgotSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <p className="text-sm text-center text-zinc-400 pb-2">
                    Digite o username cadastrado na sua conta. Enviaremos um link para redefinir sua senha.
                  </p>
                  
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      aria-label="Username"
                      placeholder="Seu username"
                      value={forgotUsername}
                      onChange={(e) => { setForgotUsername(e.target.value); setFieldErrors(prev => ({...prev, forgotUsername: ''})); }}
                      className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                    />
                    {fieldErrors.forgotUsername && (
                      <p className="text-red-400 text-xs mt-1">{fieldErrors.forgotUsername}</p>
                    )}
                  </div>

                  {error && (
                    <div role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm font-medium text-red-500 border border-red-500/20 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !forgotUsername}
                    className="w-full relative flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 focus:outline-none disabled:opacity-70 transition-all"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar Link de Recuperação'}
                  </button>
                </form>
              ) : (
                <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                  <p className="text-sm font-medium text-emerald-400">
                    Se este username estiver cadastrado, você receberá as instruções em breve.
                  </p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                    onClick={() => {
                      setView('login');
                      setForgotSuccess(false);
                      setError('');
                    }}
                  className="text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Voltar para o login
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-zinc-600">
            Canil Manager v1.0.0 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
