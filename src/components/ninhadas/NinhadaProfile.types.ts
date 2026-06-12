export interface NinhadaProfileProps {
  ninhadaId: string;
  onBack: () => void;
}

export interface TimelineStep {
  event: string;
  date: string;
  done: boolean;
}
