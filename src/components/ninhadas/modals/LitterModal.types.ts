export interface LitterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  litter?: any | null;
}

export interface AnimalOption {
  id: string;
  name: string;
  sex: string;
  breed?: string;
}

export interface PuppySlot {
  id?: string;       // preenchido na edição (puppy existente)
  ribbonColor: string;
  sex: string;
  name: string;
  birthTime?: string; // horário do nascimento (HH:mm)
  isDead?: boolean;  // filhote nascido morto
}
