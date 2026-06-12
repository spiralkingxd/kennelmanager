import { useState } from 'react';
import { NinhadasList } from './NinhadasList';
import { NinhadaProfile } from './NinhadaProfile';

export function NinhadasManager() {
  const [selectedNinhadaId, setSelectedNinhadaId] = useState<string | null>(null);

  if (selectedNinhadaId) {
    return <NinhadaProfile ninhadaId={selectedNinhadaId} onBack={() => setSelectedNinhadaId(null)} />;
  }

  return <NinhadasList onSelectNinhada={setSelectedNinhadaId} />;
}
