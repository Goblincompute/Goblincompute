import React from 'react';

/**
 * Pixel Goblin Mascot Component
 * Faithfully reproduces the 8-bit / 16-bit pixel goblin from the reference image.
 * Features crisp pixel edges, subtle 1-2px vertical float, and blinking prompt `>_`.
 */
export const GoblinMascot: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Goblin Pixel Graphic */}
      <div className="relative animate-goblin-idle">
        <svg
          width="160"
          height="140"
          viewBox="0 0 32 28"
          className="w-40 h-36 md:w-48 md:h-44 drop-shadow-[0_0_8px_rgba(96,255,112,0.3)]"
          style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        >
          {/* Colors palette:
              #60FF70 - Bright green body highlights
              #20C95A - Mid-tone green skin
              #12401B - Dark green shadow
              #C87834 - Pixel ear/chest accent brown
              #050805 - Outline dark pixel
          */}

          {/* Left Ear */}
          <rect x="2" y="7" width="5" height="2" fill="#20C95A" />
          <rect x="0" y="8" width="4" height="2" fill="#60FF70" />
          <rect x="4" y="9" width="3" height="2" fill="#C87834" />

          {/* Right Ear */}
          <rect x="25" y="7" width="5" height="2" fill="#20C95A" />
          <rect x="28" y="8" width="4" height="2" fill="#60FF70" />
          <rect x="25" y="9" width="3" height="2" fill="#C87834" />

          {/* Head Main Top */}
          <rect x="9" y="5" width="14" height="3" fill="#60FF70" />
          <rect x="8" y="8" width="16" height="4" fill="#20C95A" />

          {/* Eyes (Dark pixel sockets with bright red/green glow) */}
          <rect x="10" y="9" width="3" height="2" fill="#050805" />
          <rect x="11" y="9" width="1" height="1" fill="#FF5555" />
          <rect x="19" y="9" width="3" height="2" fill="#050805" />
          <rect x="20" y="9" width="1" height="1" fill="#FF5555" />

          {/* Snout & Mouth */}
          <rect x="13" y="11" width="6" height="2" fill="#12401B" />
          <rect x="12" y="12" width="8" height="2" fill="#60FF70" />
          {/* Teeth */}
          <rect x="13" y="12" width="1" height="1" fill="#FFFFFF" />
          <rect x="18" y="12" width="1" height="1" fill="#FFFFFF" />

          {/* Cheeks / Ear Inner Accent */}
          <rect x="7" y="11" width="3" height="2" fill="#C87834" />
          <rect x="22" y="11" width="3" height="2" fill="#C87834" />

          {/* Torso & Armor */}
          <rect x="10" y="14" width="12" height="5" fill="#20C95A" />
          <rect x="12" y="14" width="8" height="3" fill="#60FF70" />
          <rect x="14" y="16" width="4" height="3" fill="#C87834" />

          {/* Left Arm & Claw */}
          <rect x="5" y="14" width="4" height="3" fill="#20C95A" />
          <rect x="3" y="16" width="3" height="3" fill="#60FF70" />
          <rect x="2" y="18" width="2" height="2" fill="#60FF70" />

          {/* Right Arm & Claw */}
          <rect x="23" y="14" width="4" height="3" fill="#20C95A" />
          <rect x="26" y="15" width="4" height="3" fill="#60FF70" />
          <rect x="28" y="17" width="2" height="3" fill="#60FF70" />

          {/* Legs & Feet */}
          <rect x="9" y="19" width="4" height="4" fill="#12401B" />
          <rect x="19" y="19" width="4" height="4" fill="#12401B" />

          <rect x="7" y="22" width="6" height="3" fill="#20C95A" />
          <rect x="19" y="22" width="6" height="3" fill="#20C95A" />

          <rect x="6" y="24" width="7" height="2" fill="#60FF70" />
          <rect x="19" y="24" width="7" height="2" fill="#60FF70" />
        </svg>

        {/* Prompt right next to Goblin's feet matching reference */}
        <div className="absolute -right-8 bottom-2 flex items-center gap-1 font-mono text-[#60FF70] text-sm font-bold select-none">
          <span>&gt;</span>
          <span className="w-2 h-4 bg-[#60FF70] inline-block animate-blink"></span>
        </div>
      </div>

      {/* Horizontal Baseline / Ground Line with glitch noise artifacts matching reference */}
      <div className="w-full max-w-[280px] sm:max-w-[340px] mt-2 relative">
        <div className="h-[1px] bg-[#60FF70]/40 w-full"></div>
        {/* Pixel glitch artifacts along baseline */}
        <div className="absolute -top-[1px] left-12 w-1.5 h-[2px] bg-[#60FF70]"></div>
        <div className="absolute -top-[2px] left-28 w-1 h-[3px] bg-[#60FF70]"></div>
        <div className="absolute -top-[1px] right-16 w-2 h-[2px] bg-[#60FF70]"></div>
      </div>
    </div>
  );
};
