import React from 'react';
import { cn } from '../types';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle }) => {
  return (
    <div className={cn('bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden', className)}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-bottom border-zinc-50">
          {title && <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
