import React from 'react';

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'bracket' | 'danger';
  iconArrow?: boolean;
  children: React.ReactNode;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  variant = 'outline',
  iconArrow = false,
  children,
  className = '',
  ...props
}) => {
  let baseStyle = "font-mono font-bold transition-all text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 cursor-pointer select-none border border-[#60FF70]";

  if (variant === 'primary') {
    // Solid filled bright neon green button matching [ ENTER THE CAVE ] in reference
    baseStyle = "bg-[#60FF70] text-[#050805] hover:bg-[#80FF8E] border-[#60FF70] px-4 py-2 font-pixel text-xs tracking-wider uppercase shadow-[0_0_12px_rgba(96,255,112,0.4)] active:translate-y-0.5 cursor-pointer";
  } else if (variant === 'bracket') {
    // Minimal bracket button like [ HOME ], [ CONNECT ]
    baseStyle = "bg-transparent text-[#60FF70] hover:bg-[#60FF70]/10 border-[#60FF70] px-3 py-1.5 font-mono text-xs cursor-pointer";
  } else if (variant === 'outline') {
    // Standard 1px green border outlined button like [ READ DOCS ]
    baseStyle = "bg-transparent text-[#60FF70] hover:bg-[#60FF70]/15 hover:shadow-[0_0_8px_rgba(96,255,112,0.3)] border-[#60FF70] px-4 py-2 font-mono text-xs cursor-pointer";
  } else if (variant === 'danger') {
    baseStyle = "bg-red-950/40 text-red-400 hover:bg-red-900/60 border-red-500 px-3 py-1.5 font-mono text-xs cursor-pointer";
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {iconArrow && <span className="text-xs">▶</span>}
      {children}
    </button>
  );
};
