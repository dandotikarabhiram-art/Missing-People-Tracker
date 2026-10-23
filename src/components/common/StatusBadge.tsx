import React from 'react';
import { CaseStatus, CasePriority } from '../../types';

export const StatusBadge: React.FC<{ status: CaseStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (status) {
    case 'Verified / Active':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'Under Investigation':
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-300';
      break;
    case 'New Lead Received':
      colorStyles = 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
      break;
    case 'Located — Awaiting Confirmation':
      colorStyles = 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold';
      break;
    case 'Resolved / Closed':
      colorStyles = 'bg-purple-50 text-purple-800 border-purple-300';
      break;
    case 'Pending Review':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'Rejected':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-300';
      break;
    case 'Withdrawn':
      colorStyles = 'bg-slate-100 text-slate-500 border-slate-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: CasePriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  if (priority === 'Critical / Endangered') {
    styles = 'bg-red-50 text-red-800 border-red-300 font-bold animate-pulse';
  } else if (priority === 'High') {
    styles = 'bg-orange-50 text-orange-800 border-orange-300 font-semibold';
  } else if (priority === 'Medium') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${styles} ${className}`}>
      {priority}
    </span>
  );
};
