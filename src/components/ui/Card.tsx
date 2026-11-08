import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, action, children, className = '' }: CardProps) {
  return (
    <section className={`card animate-fade-in p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-night-100">{title}</h2>}
            {description && <p className="mt-1 text-sm text-night-300">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
