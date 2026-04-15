import { LoginForm } from "./auth/login/components/LoginForm";

const logo = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#020810" />
        <stop offset="100%" stopColor="#0a1e3a" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3a72e8" />
        <stop offset="100%" stopColor="#1a3a8a" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="textglow" x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="bigglow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id="rotorDisc" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#88ccff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#4488cc" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="engGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#66bbff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#2244ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="muzzle" cx="30%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#ffee44" />
        <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="trail" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffee44" stopOpacity="0" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="divider" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#44aaff" stopOpacity="0" />
        <stop offset="30%" stopColor="#44aaff" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#44aaff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#44aaff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="subline" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff6600" stopOpacity="0" />
        <stop offset="50%" stopColor="#ffaa44" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="120" rx="16" ry="16" fill="url(#bg)" />
    <rect x="0.5" y="0.5" width="319" height="119" rx="15.5" ry="15.5"
      fill="none" stroke="#1e4488" widths="1" opacity="0.6" />
    <rect x="1.5" y="1.5" width="317" height="117" rx="14.5" ry="14.5"
      fill="none" stroke="#44aaff" widths="0.5" opacity="0.18" />
    <circle cx="14" cy="12" r="1" fill="#fff" opacity="0.6" />
    <circle cx="52" cy="8" r="1.2" fill="#adf" opacity="0.5" />
    <circle cx="88" cy="18" r="0.9" fill="#fff" opacity="0.7" />
    <circle cx="290" cy="10" r="1" fill="#ffd" opacity="0.6" />
    <circle cx="308" cy="22" r="1.2" fill="#fff" opacity="0.5" />
    <circle cx="270" cy="8" r="0.8" fill="#adf" opacity="0.6" />
    <circle cx="130" cy="6" r="0.9" fill="#fff" opacity="0.4" />
    <circle cx="28" cy="62" r="20" fill="url(#engGlow)" opacity="0.55" />
    <ellipse cx="76" cy="34" rx="50" ry="7" fill="url(#rotorDisc)" opacity="0.8" />
    <g transform="translate(76,34)" opacity="0.5">
      <line x1="-48" y1="0" x2="48" y2="0" stroke="#aaddff" widths="1.5" />
      <line x1="-38" y1="-4" x2="38" y2="4" stroke="#aaddff" widths="1" opacity="0.55" />
      <line x1="-38" y1="4" x2="38" y2="-4" stroke="#aaddff" widths="1" opacity="0.55" />
    </g>
    <ellipse cx="31" cy="56" rx="4" ry="10" fill="url(#rotorDisc)" opacity="0.6" />
    <g transform="translate(18, 36)">
      <polygon points="28,13 62,14 62,19 28,18" fill="#2a3a5a" />
      <polygon points="58,14 65,7 65,14" fill="#1a2a40" />
      <path d="M4,16 C4,5 10,5 17,6 L44,6 C52,6 55,10 55,16 C55,22 52,25 44,25 L12,25 C7,25 4,22 4,16 Z"
        fill="url(#bodyGrad)" />
      <ellipse cx="30" cy="9" rx="14" ry="3.5" fill="#5a8ee0" opacity="0.4" />
      <line x1="30" y1="6" x2="30" y2="25" stroke="#88aaff" widths="0.5" opacity="0.2" />
      <ellipse cx="18" cy="15" rx="10" ry="7.5" fill="#4ab8f0" opacity="0.92" />
      <ellipse cx="15" cy="12" rx="3.5" ry="2" fill="#ffffff" opacity="0.55" />
      <ellipse cx="18" cy="15" rx="10" ry="7.5" fill="none" stroke="#88ccff" widths="0.8" opacity="0.5" />
      <polygon points="4,12 0,16 4,20" fill="#1a3e8a" />
      <rect x="44" y="11" width="10" height="12" rx="2" fill="#223355" />
      <rect x="54" y="13" width="15" height="2" rx="1" fill="#445566" />
      <rect x="54" y="18" width="15" height="2" rx="1" fill="#445566" />
      <g stroke="#1a2a5a" widths="1.8" fill="none">
        <line x1="8" y1="25" x2="8" y2="31" />
        <line x1="40" y1="25" x2="40" y2="31" />
        <line x1="5" y1="31" x2="44" y2="31" />
        <line x1="7" y1="31" x2="7" y2="34" />
        <line x1="39" y1="31" x2="39" y2="34" />
      </g>
      <circle cx="28" cy="6" r="3.5" fill="#111122" />
    </g>
    <rect x="70" y="49" width="52" height="2.5" rx="1.2" fill="url(#trail)" opacity="0.9" />
    <rect x="70" y="56" width="52" height="2.5" rx="1.2" fill="url(#trail)" opacity="0.9" />
    <circle cx="124" cy="51" r="8" fill="url(#muzzle)" opacity="0.7" filter="url(#glow)" />
    <circle cx="124" cy="51" r="3.5" fill="#ffffff" opacity="0.95" />
    <circle cx="124" cy="58" r="8" fill="url(#muzzle)" opacity="0.7" filter="url(#glow)" />
    <circle cx="124" cy="58" r="3.5" fill="#ffffff" opacity="0.95" />
    <line x1="140" y1="60" x2="312" y2="60" stroke="url(#divider)" widths="0.8" opacity="0.5" />
    <text x="228" y="52" textAnchor="middle"
      fontFamily="'Arial Black', 'Impact', sans-serif"
      fontSize="34" fontWeight="900" letterSpacing="2"
      fill="#1155cc" opacity="0.6" filter="url(#bigglow)">GUNSHIP</text>
    <text x="228" y="52" textAnchor="middle"
      fontFamily="'Arial Black', 'Impact', sans-serif"
      fontSize="34" fontWeight="900" letterSpacing="2"
      fill="#88ccff">GUNSHIP</text>
    <text x="228" y="52" textAnchor="middle"
      fontFamily="'Arial Black', 'Impact', sans-serif"
      fontSize="34" fontWeight="900" letterSpacing="2"
      fill="#ffffff" opacity="0.12">GUNSHIP</text>
    <text x="228" y="80" textAnchor="middle"
      fontFamily="'Arial Black', 'Impact', sans-serif"
      fontSize="18" fontWeight="900" letterSpacing="8"
      fill="#ff5500" opacity="0.5" filter="url(#textglow)">LEGEND</text>
    <text x="228" y="80" textAnchor="middle"
      fontFamily="'Arial Black', 'Impact', sans-serif"
      fontSize="18" fontWeight="900" letterSpacing="8"
      fill="#ff8833">LEGEND</text>
    <line x1="155" y1="85" x2="302" y2="85" stroke="url(#subline)" widths="1.2" />
    <text x="228" y="106" textAnchor="middle"
      fontFamily="'Courier New', Courier, monospace"
      fontSize="8" letterSpacing="3.5"
      fill="#44aaff" opacity="0.45">CLASSIFIED · AIR SUPERIORITY</text>
  </svg>
)

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-centerrounded-2xl  mb-4 ">
            {/* {logo} */}
          </div>

          <h1 className="text-white text-3xl font-black tracking-tighter uppercase italic">
            Gunship <span className="text-rose-500">Legend</span>
          </h1>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer Link */}
        {/* <p className="text-center mt-8 text-neutral-600 text-xs font-medium">
                        New Player? <span className="text-red-500 cursor-pointer hover:underline">Register your Deck</span>
                    </p> */}
      </div>
    </div>


    // <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    //   <div className="w-full max-w-sm">
    //     <LoginForm />
    //   </div>
    // </div>
  );
}
