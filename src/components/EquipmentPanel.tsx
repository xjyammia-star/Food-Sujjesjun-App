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

interface EquipmentInfo {
  emoji: string;
  labelEn: string;
  labelZh: string;
}

export const EQUIPMENT_INFO: Record<Equipment, EquipmentInfo> = {
  oven:        { emoji: '🔥', labelEn: 'Oven',           labelZh: '烤箱' },
  stovetop:    { emoji: '🍳', labelEn: 'Stovetop',       labelZh: '炉灶' },
  microwave:   { emoji: '📡', labelEn: 'Microwave',      labelZh: '微波炉' },
  airFryer:    { emoji: '💨', labelEn: 'Air Fryer',      labelZh: '空气炸锅' },
  slowCooker:  { emoji: '🫕', labelEn: 'Slow Cooker',   labelZh: '慢炖锅' },
  riceCooker:  { emoji: '🍚', labelEn: 'Rice Cooker',   labelZh: '电饭锅' },
  blender:     { emoji: '🌀', labelEn: 'Blender',        labelZh: '搅拌机' },
  grill:       { emoji: '🥩', labelEn: 'Grill',          labelZh: '烤架' },
  instantPot:  { emoji: '⚡', labelEn: 'Instant Pot',   labelZh: '高压锅' },
  toasterOven: { emoji: '🍞', labelEn: 'Toaster Oven', labelZh: '小烤箱' },
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
              <span className={styles.emoji}>{info.emoji}</span>
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
