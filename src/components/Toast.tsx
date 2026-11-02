import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0D1713]/95 border border-[rgba(100,255,202,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#64FFCA] shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-[#FF647C] shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-[#00D68F] shrink-0" />}
      <span className="text-sm font-medium text-[#F3FFF9]">{toastMessage.text}</span>
    </div>
  );
};
