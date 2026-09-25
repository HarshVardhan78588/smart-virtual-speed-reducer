import React from 'react';
import {
  CheckCircle2,
  Clock,
  Ban,
  FileEdit,
  AlertTriangle,
  Lock,
  Eye,
  ShieldCheck,
  AlertOctagon,
  Shield,
  Activity,
  WifiOff,
  Check
} from 'lucide-react';

export type BadgeType =
  | 'active'
  | 'scheduled'
  | 'expired'
  | 'disabled'
  | 'draft'
  | 'warning'
  | 'blocked'
  | 'under_review'
  | 'cleared'
  | 'high_risk'
  | 'medium_risk'
  | 'low_risk'
  | 'nominal'
  | 'degraded'
  | 'offline'
  | 'verification_pending';

interface StatusBadgeProps {
  status: BadgeType | string;
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  size = 'md',
  className = ''
}) => {
  const normalized = status.toLowerCase();

  let label = customLabel || '';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
  let visualClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800';

  switch (normalized) {
    case 'active':
      label = customLabel || 'ACTIVE';
      icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />;
      visualClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold';
      break;

    case 'scheduled':
      label = customLabel || 'SCHEDULED';
      icon = <Clock className="w-3.5 h-3.5 shrink-0 text-sky-600" aria-hidden="true" />;
      visualClasses = 'bg-sky-50 border-sky-200 text-sky-800 font-medium';
      break;

    case 'expired':
      label = customLabel || 'EXPIRED';
      icon = <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />;
      visualClasses = 'bg-slate-100 border-slate-200 text-slate-600 line-through decoration-slate-400';
      break;

    case 'disabled':
      label = customLabel || 'DISABLED';
      icon = <Ban className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />;
      visualClasses = 'bg-slate-100 border-slate-300 text-slate-700 font-medium';
      break;

    case 'draft':
      label = customLabel || 'DRAFT (UNPUBLISHED)';
      icon = <FileEdit className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
      visualClasses = 'bg-amber-50 border-dashed border-amber-300 text-amber-900 font-semibold';
      break;

    case 'warning':
      label = customLabel || 'WARNING';
      icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
      visualClasses = 'bg-amber-50 border-amber-300 text-amber-900 font-semibold';
      break;

    case 'blocked':
    case 'permanently_disabled':
      label = customLabel || 'OVERRIDE BLOCKED';
      icon = <Lock className="w-3.5 h-3.5 shrink-0 text-rose-600" aria-hidden="true" />;
      visualClasses = 'bg-rose-50 border-rose-300 text-rose-900 font-bold tracking-wider';
      break;

    case 'under_review':
      label = customLabel || 'UNDER REVIEW';
      icon = <Eye className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
      visualClasses = 'bg-amber-50 border-amber-300 text-amber-900 font-semibold';
      break;

    case 'verification_pending':
      label = customLabel || 'VERIFICATION PENDING';
      icon = <Clock className="w-3.5 h-3.5 shrink-0 text-sky-600" aria-hidden="true" />;
      visualClasses = 'bg-sky-50 border-sky-300 text-sky-900 font-medium';
      break;

    case 'cleared':
      label = customLabel || 'CLEARED';
      icon = <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />;
      visualClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium';
      break;

    case 'high_risk':
    case 'high':
      label = customLabel || 'HIGH RISK';
      icon = <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-600" aria-hidden="true" />;
      visualClasses = 'bg-rose-50 border-rose-300 text-rose-900 font-bold';
      break;

    case 'medium_risk':
    case 'medium':
      label = customLabel || 'MEDIUM RISK';
      icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
      visualClasses = 'bg-amber-50 border-amber-300 text-amber-900 font-semibold';
      break;

    case 'low_risk':
    case 'low':
      label = customLabel || 'LOW RISK';
      icon = <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />;
      visualClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium';
      break;

    case 'nominal':
      label = customLabel || 'NOMINAL';
      icon = <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />;
      visualClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium';
      break;

    case 'degraded':
      label = customLabel || 'DEGRADED';
      icon = <Activity className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
      visualClasses = 'bg-amber-50 border-amber-300 text-amber-800 font-medium';
      break;

    case 'offline':
      label = customLabel || 'OFFLINE';
      icon = <WifiOff className="w-3.5 h-3.5 shrink-0 text-rose-600" aria-hidden="true" />;
      visualClasses = 'bg-rose-50 border-rose-200 text-rose-800 font-medium';
      break;

    default:
      label = customLabel || status.toUpperCase();
      visualClasses = 'bg-slate-100 border-slate-300 text-slate-800 font-medium';
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center border rounded-md uppercase tracking-wide whitespace-nowrap select-none shadow-xs ${visualClasses} ${sizeClasses} ${className}`}
      role="status"
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
