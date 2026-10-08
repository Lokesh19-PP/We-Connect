'use client';

// ──────────────────────────────────────────────
// We Connect – PageHeader Component
// Standardized Page Title (24px semibold) & Subtitle
// ──────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
      <div className="space-y-1">
        <h1 className="text-[24px] font-semibold text-[#111827] tracking-tight leading-8 flex items-center space-x-2.5">
          {Icon && <Icon className="w-6 h-6 text-[#F97316] shrink-0" />}
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-[14px] text-[#6B7280] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
