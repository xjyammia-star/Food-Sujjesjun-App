import React from 'react';
import styles from './EquipmentPanel.module.css';

export type Equipment =
  | 'oven'
  | 'stovetop'
  | 'microwave'
  | 'airFryer'
  | 'slowCooker'
  | 'riceCooker'
  | 'blender'
  | 'grill'
  | 'instantPot'
  | 'toasterOven';

export const ALL_EQUIPMENT: Equipment[] = [
  'oven',
  'stovetop',
  'microwave',
  'airFryer',
  'slowCooker',
  'riceCooker',
  'blender',
  'grill',
  'instantPot',
  'toasterOven',
];

// SVG icons that actually look like the appliances
const ICONS: Record<Equipment, React.ReactNode> = {
  oven: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="40" height="36" rx="4" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      <rect x="4" y="8" width="40" height="12" rx="4" fill="#b5a691" stroke="#7c6f5e" strokeWidth="2"/>
      <circle cx="14" cy="14" r="3" fill="#7c6f5e"/>
      <circle cx="24" cy="14" r="3" fill="#7c6f5e"/>
      <circle cx="34" cy="14" r="3" fill="#7c6f5e"/>
      <rect x="10" y="24" width="28" height="16" rx="2" fill="#8cc5e0" stroke="#7c6f5e" strokeWidth="1.5"/>
      <line x1="10" y1="32" x2="38" y2="32" stroke="#7c6f5e" strokeWidth="1.5"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="#7c6f5e" strokeWidth="1.5"/>
    </svg>
  ),
  stovetop: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="40" height="28" rx="4" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="2"/>
      <ellipse cx="14" cy="20" rx="7" ry="7" fill="#a09080" stroke="#7c6f5e" strokeWidth="1.5"/>
      <ellipse cx="14" cy="20" rx="4" ry="4" fill="#7c6f5e"/>
      <ellipse cx="34" cy="20" rx="7" ry="7" fill="#a09080" stroke="#7c6f5e" strokeWidth="1.5"/>
      <ellipse cx="34" cy="20" rx="4" ry="4" fill="#7c6f5e"/>
      <ellipse cx="14" cy="34" rx="5" ry="5" fill="#a09080" stroke="#7c6f5e" strokeWidth="1.5"/>
      <ellipse cx="14" cy="34" rx="3" ry="3" fill="#7c6f5e"/>
      <ellipse cx="34" cy="34" rx="5" ry="5" fill="#a09080" stroke="#7c6f5e" strokeWidth="1.5"/>
      <ellipse cx="34" cy="34" rx="3" ry="3" fill="#7c6f5e"/>
    </svg>
  ),
  microwave: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="42" height="28" rx="4" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      <rect x="7" y="14" width="24" height="20" rx="2" fill="#8cc5e0" stroke="#7c6f5e" strokeWidth="1.5"/>
      <rect x="34" y="14" width="7" height="20" rx="2" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      <circle cx="37.5" cy="19" r="2" fill="#7c6f5e"/>
      <circle cx="37.5" cy="25" r="2" fill="#7c6f5e"/>
      <circle cx="37.5" cy="31" r="2" fill="#ea580c"/>
      <line x1="31" y1="14" x2="31" y2="34" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* door handle */}
      <rect x="28" y="20" width="2" height="8" rx="1" fill="#7c6f5e"/>
    </svg>
  ),
  airFryer: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="10" y="8" width="28" height="34" rx="8" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* basket drawer */}
      <rect x="14" y="28" width="20" height="10" rx="3" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* handle on drawer */}
      <rect x="20" y="35" width="8" height="3" rx="1.5" fill="#7c6f5e"/>
      {/* top display panel */}
      <rect x="14" y="10" width="20" height="14" rx="4" fill="#3b3530" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* dial */}
      <circle cx="24" cy="17" r="4" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      <circle cx="24" cy="17" r="1.5" fill="#7c6f5e"/>
    </svg>
  ),
  slowCooker: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* base */}
      <rect x="6" y="20" width="36" height="22" rx="4" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* pot */}
      <ellipse cx="24" cy="20" rx="16" ry="8" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* lid */}
      <ellipse cx="24" cy="18" rx="14" ry="5" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* lid handle */}
      <ellipse cx="24" cy="14" rx="4" ry="2.5" fill="#7c6f5e"/>
      {/* side handles */}
      <rect x="2" y="26" width="4" height="8" rx="2" fill="#7c6f5e"/>
      <rect x="42" y="26" width="4" height="8" rx="2" fill="#7c6f5e"/>
      {/* control light */}
      <circle cx="24" cy="36" r="2" fill="#ea580c"/>
    </svg>
  ),
  riceCooker: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="8" y="18" width="32" height="24" rx="4" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* domed lid */}
      <path d="M8 20 Q8 8 24 8 Q40 8 40 20" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* lid handle */}
      <rect x="20" y="5" width="8" height="5" rx="2.5" fill="#7c6f5e"/>
      {/* front panel */}
      <rect x="12" y="30" width="24" height="8" rx="2" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1"/>
      {/* button */}
      <rect x="16" y="33" width="8" height="3" rx="1.5" fill="#ea580c"/>
      {/* light */}
      <circle cx="32" cy="34.5" r="2" fill="#22c55e"/>
    </svg>
  ),
  blender: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* base */}
      <rect x="12" y="36" width="24" height="8" rx="3" fill="#b5a691" stroke="#7c6f5e" strokeWidth="2"/>
      {/* motor body */}
      <rect x="15" y="28" width="18" height="10" rx="2" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* jug — tapers toward bottom */}
      <path d="M17 28 L14 8 L34 8 L31 28 Z" fill="#8cc5e0" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* jug lid */}
      <rect x="14" y="5" width="20" height="4" rx="2" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* lid handle */}
      <rect x="21" y="3" width="6" height="3" rx="1.5" fill="#7c6f5e"/>
      {/* spout */}
      <path d="M34 10 L38 12 L36 16 L34 14" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1"/>
      {/* button on base */}
      <circle cx="24" cy="32" r="2" fill="#ea580c"/>
    </svg>
  ),
  grill: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* legs */}
      <line x1="16" y1="38" x2="12" y2="46" stroke="#7c6f5e" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="38" x2="36" y2="46" stroke="#7c6f5e" strokeWidth="2.5" strokeLinecap="round"/>
      {/* bowl */}
      <path d="M6 20 Q6 38 24 38 Q42 38 42 20 Z" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* lid */}
      <path d="M6 20 Q6 6 24 6 Q42 6 42 20 Z" fill="#b5a691" stroke="#7c6f5e" strokeWidth="2"/>
      {/* lid handle */}
      <rect x="20" y="3" width="8" height="4" rx="2" fill="#7c6f5e"/>
      {/* grill grates */}
      <line x1="14" y1="20" x2="14" y2="34" stroke="#7c6f5e" strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="20" y2="36" stroke="#7c6f5e" strokeWidth="1.5"/>
      <line x1="26" y1="20" x2="26" y2="37" stroke="#7c6f5e" strokeWidth="1.5"/>
      <line x1="32" y1="20" x2="32" y2="36" stroke="#7c6f5e" strokeWidth="1.5"/>
    </svg>
  ),
  instantPot: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="8" y="16" width="32" height="26" rx="5" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* lid */}
      <rect x="8" y="10" width="32" height="8" rx="4" fill="#c9bfb0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* pressure valve */}
      <rect x="20" y="6" width="8" height="5" rx="2" fill="#7c6f5e"/>
      <circle cx="24" cy="5" r="2" fill="#ea580c"/>
      {/* side handles */}
      <rect x="2" y="22" width="6" height="10" rx="3" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      <rect x="40" y="22" width="6" height="10" rx="3" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* front display */}
      <rect x="13" y="26" width="22" height="10" rx="2" fill="#3b3530" stroke="#7c6f5e" strokeWidth="1"/>
      <rect x="15" y="28" width="10" height="6" rx="1" fill="#8cc5e0" opacity="0.6"/>
      <circle cx="32" cy="31" r="2.5" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1"/>
    </svg>
  ),
  toasterOven: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="4" y="12" width="40" height="26" rx="4" fill="#d6c7b0" stroke="#7c6f5e" strokeWidth="2"/>
      {/* glass door */}
      <rect x="8" y="16" width="24" height="18" rx="2" fill="#8cc5e0" stroke="#7c6f5e" strokeWidth="1.5"/>
      {/* door handle */}
      <rect x="9" y="32" width="22" height="3" rx="1.5" fill="#7c6f5e"/>
      {/* heating elements inside door */}
      <line x1="10" y1="20" x2="30" y2="20" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="10" y1="28" x2="30" y2="28" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* right panel controls */}
      <rect x="35" y="16" width="5" height="18" rx="2" fill="#b5a691" stroke="#7c6f5e" strokeWidth="1"/>
      <circle cx="37.5" cy="21" r="2" fill="#7c6f5e"/>
      <circle cx="37.5" cy="29" r="2" fill="#ea580c"/>
      {/* feet */}
      <rect x="8" y="36" width="6" height="4" rx="2" fill="#7c6f5e"/>
      <rect x="34" y="36" width="6" height="4" rx="2" fill="#7c6f5e"/>
    </svg>
  ),
};

interface EquipmentInfo {
  labelEn: string;
  labelZh: string;
}

export const EQUIPMENT_INFO: Record<Equipment, EquipmentInfo> = {
  oven:        { labelEn: 'Oven',         labelZh: '烤箱' },
  stovetop:    { labelEn: 'Stovetop',     labelZh: '炉灶' },
  microwave:   { labelEn: 'Microwave',    labelZh: '微波炉' },
  airFryer:    { labelEn: 'Air Fryer',    labelZh: '空气炸锅' },
  slowCooker:  { labelEn: 'Slow Cooker', labelZh: '慢炖锅' },
  riceCooker:  { labelEn: 'Rice Cooker', labelZh: '电饭锅' },
  blender:     { labelEn: 'Blender',      labelZh: '搅拌机' },
  grill:       { labelEn: 'Grill',        labelZh: '烤架' },
  instantPot:  { labelEn: 'Instant Pot', labelZh: '高压锅' },
  toasterOven: { labelEn: 'Toaster Oven',labelZh: '小烤箱' },
};

interface Props {
  available: Set<Equipment>;
  onChange: (updated: Set<Equipment>) => void;
  lang: 'en' | 'zh';
}

const EquipmentPanel: React.FC<Props> = ({ available, onChange, lang }) => {
  const toggle = (eq: Equipment) => {
    const next = new Set(available);
    if (next.has(eq)) {
      next.delete(eq);
    } else {
      next.add(eq);
    }
    onChange(next);
  };

  const heading = lang === 'zh' ? '我有哪些厨具？' : 'What equipment do you have?';
  const subtext =
    lang === 'zh'
      ? '关闭你没有的厨具，AI 将不会生成需要它的食谱。'
      : "Turn off equipment you don't have — recipes won't use it.";

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{heading}</h3>
        <p className={styles.subtext}>{subtext}</p>
      </div>
      <div className={styles.grid}>
        {ALL_EQUIPMENT.map((eq) => {
          const info = EQUIPMENT_INFO[eq];
          const isOn = available.has(eq);
          return (
            <button
              key={eq}
              className={`${styles.tile} ${isOn ? styles.on : styles.off}`}
              onClick={() => toggle(eq)}
              aria-pressed={isOn}
              title={isOn ? (lang === 'zh' ? '点击关闭' : 'Click to disable') : (lang === 'zh' ? '点击开启' : 'Click to enable')}
            >
              <span className={styles.icon}>{ICONS[eq]}</span>
              <span className={styles.label}>
                {lang === 'zh' ? info.labelZh : info.labelEn}
              </span>
              <span className={`${styles.badge} ${isOn ? styles.badgeOn : styles.badgeOff}`}>
                {isOn
                  ? (lang === 'zh' ? '✓ 有' : '✓ Have')
                  : (lang === 'zh' ? '✕ 无' : '✕ None')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentPanel;
