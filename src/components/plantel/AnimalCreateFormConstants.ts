export interface AnimalCreateFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export const SEX_OPTIONS = [
  { value: 'MALE', label: 'Macho' },
  { value: 'FEMALE', label: 'Fêmea' },
];

export const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
  { value: 'GIANT', label: 'Gigante' },
];

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'DECEASED', label: 'Falecido' },
  { value: 'SOLD', label: 'Vendido' },
];

export const initialForm = {
  name: '',
  breed: '',
  sex: 'MALE' as string,
  size: 'MEDIUM' as string,
  color: '',
  weight: '' as string,
  birthDate: '',
  microchip: '',
  registrationNumber: '',
  pedigreeNumber: '',
  photoUrl: '',
  status: 'ACTIVE' as string,
  origin: '',
  breeder: '',
  purchaseDate: '',
  purchasePrice: '' as string,
  notes: '',
  fatherId: '',
  motherId: '',
  ownerId: '',
};

export type FormData = typeof initialForm;
