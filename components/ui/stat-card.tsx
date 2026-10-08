'use client';

// ──────────────────────────────────────────────
// We Connect – StatCard Component
// Card radius 10px, padding 20px, 1px border, soft shadow
// ──────────────────────────────────────────────
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    direction?: 'up' | 'down';
  };
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: 'orange' | 'blue' | 'green' | 'amber' | 'red';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accentColor = 'orange',
  onClick,
}: StatCardProps) {
  const accentClasses = {
    orange: 'text-[#F97316] bg-[#F97316]/10',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-rose-600 bg-rose-50',
  }[accentColor];

  const isUp = trend
    ? trend.direction
      ? trend.direction === 'up'
      : Boolean(trend.isPositive)
    : false;

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-[#F97316]/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#6B7280]">
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-[8px] ${accentClasses}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-[24px] font-semibold text-[#111827] tracking-tight">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center space-x-1 text-[12px] font-semibold ${
              isUp ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </span>
        )}
      </div>

      {hint && (
        <p className="text-[12px] text-[#6B7280] mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
