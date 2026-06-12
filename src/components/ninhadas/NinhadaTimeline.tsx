import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { generateTimeline } from './NinhadaProfile.utils';

interface NinhadaTimelineProps {
  litter: any;
}

export function NinhadaTimeline({ litter }: NinhadaTimelineProps) {
  const steps = generateTimeline(litter);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
       <h3 className="text-lg font-bold text-white mb-6">Etapas e Marcos</h3>

       <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-zinc-800 ml-1">
         {steps.map((step, i) => (
           <div key={i} className="relative flex items-start gap-4">
             <div className="relative z-10 bg-zinc-900 rounded-full">
               {step.done ? (
                 <CheckCircle2 size={20} className="text-emerald-500 bg-zinc-900" />
               ) : (
                 <Circle size={20} className="text-zinc-700 bg-zinc-900" />
               )}
             </div>
             <div className="flex flex-col pt-0.5">
               <span className={`text-sm font-semibold ${step.done ? 'text-zinc-200' : 'text-zinc-500'}`}>{step.event}</span>
               <span className="text-xs font-medium text-zinc-500 mt-1 flex items-center gap-1"><Clock size={12} /> {step.date}</span>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
}
