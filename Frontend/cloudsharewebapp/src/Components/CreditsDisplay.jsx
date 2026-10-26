import React from 'react';
import { CreditCard } from 'lucide-react';
const CreditsDisplay = ({credits}) => {
  return (
    <div className="flex items-center gap-2 text-blue-700 px-2 py-1 5 rounded-full bg-blue-50 ">
      <CreditCard size={16} ></CreditCard>
      <span className="text-sm font-medium">{credits}</span>
      <span className="text-sm font-medium">credits</span>
    </div>
  );
}

export default CreditsDisplay;
