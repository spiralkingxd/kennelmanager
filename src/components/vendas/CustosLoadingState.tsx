export function CustosLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm text-zinc-400">Carregando custos...</span>
        </div>
      </div>
    </div>
  );
}
