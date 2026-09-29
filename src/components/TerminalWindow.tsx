import React from 'react';

interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footerGraphic?: React.ReactNode;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title,
  children,
  className = '',
  footerGraphic,
}) => {
  return (
    <div className={`border border-[#60FF70] bg-[#050805] p-3.5 relative flex flex-col justify-between box-glow ${className}`}>
      <div>
        {title && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-widest text-[#60FF70] uppercase">
              <span>{title}</span>
            </div>
            <div className="h-[1px] bg-[#60FF70]/50 w-full mt-2"></div>
          </div>
        )}
        <div className="font-mono text-xs text-[#60FF70]">
          {children}
        </div>
      </div>
      {footerGraphic && (
        <div className="mt-3 flex justify-end">
          {footerGraphic}
        </div>
      )}
    </div>
  );
};
