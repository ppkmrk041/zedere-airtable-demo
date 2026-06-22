// ไฟล์: src/app/core/services/theme.service.ts

import { Injectable } from '@angular/core';

export type ThemeMode = 'LIGHT' | 'DARK';
export type ThemeBasePreset =
  | 'ZEDERE'
  | 'NGX_ADMIN'
  | 'BACKEND'
  | 'OCEAN'
  | 'FOREST'
  | 'SUNSET'
  | 'MIDNIGHT'
  | 'SLATE'
  | 'ROSE';

export interface ThemeState {
  basePreset: ThemeBasePreset;
  mode: ThemeMode;
  themePreset: string;
  themeAccentColor: string;
}

export interface ThemePresetOption {
  value: ThemeBasePreset;
  basePreset: ThemeBasePreset;
  label: string;
  description: string;
  accent: string;
  accentColor: string;
}

type Palette = {
  bg: string;
  bgSoft: string;
  surface: string;
  surface2: string;
  surface3: string;
  text: string;
  textSoft: string;
  textMute: string;
  border: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarMute: string;
  sidebarActive: string;
  headerBg: string;
  shadowSm: string;
  shadow: string;
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storagePresetKey = 'app.themePreset';
  private readonly storageAccentKey = 'app.themeAccentColor';

  readonly defaultBasePreset: ThemeBasePreset = 'NGX_ADMIN';
  readonly defaultMode: ThemeMode = 'LIGHT';
  readonly defaultAccentColor = '#3366FF';

  readonly presetOptions: ThemePresetOption[] = [
    {
      value: 'NGX_ADMIN',
      basePreset: 'NGX_ADMIN',
      label: 'ngx-admin ERP',
      description: 'Master Color',
      accent: '#3366FF',
      accentColor: '#3366FF',
    },
    {
      value: 'BACKEND',
      basePreset: 'BACKEND',
      label: 'Backend ERP',
      description: 'เขียวน้ำทะเล',
      accent: '#00C7A7',
      accentColor: '#00C7A7',
    },
    {
      value: 'ZEDERE',
      basePreset: 'ZEDERE',
      label: 'Zedere Luxury',
      description: 'โทนดำ-ทอง',
      accent: '#D6A84F',
      accentColor: '#D6A84F',
    },
    {
      value: 'OCEAN',
      basePreset: 'OCEAN',
      label: 'Ocean',
      description: 'โทนฟ้าใช้งานทั่วไป อ่านง่าย',
      accent: '#0284C7',
      accentColor: '#0284C7',
    },
    {
      value: 'FOREST',
      basePreset: 'FOREST',
      label: 'Forest',
      description: 'โทนเขียว เหมาะกับคลังสินค้า/คุณภาพ/สถานะพร้อมใช้งาน',
      accent: '#16A34A',
      accentColor: '#16A34A',
    },
    {
      value: 'SUNSET',
      basePreset: 'SUNSET',
      label: 'Sunset',
      description: 'โทนส้ม เหมาะกับ production/action page',
      accent: '#EA580C',
      accentColor: '#EA580C',
    },
    {
      value: 'MIDNIGHT',
      basePreset: 'MIDNIGHT',
      label: 'Midnight',
      description: 'โทนมืดสำหรับ command center',
      accent: '#8B5CF6',
      accentColor: '#8B5CF6',
    },
    {
      value: 'SLATE',
      basePreset: 'SLATE',
      label: 'Slate',
      description: 'โทนเทา corporate ใช้งานได้ทุกระบบ',
      accent: '#475569',
      accentColor: '#475569',
    },
    {
      value: 'ROSE',
      basePreset: 'ROSE',
      label: 'Rose',
      description: 'โทนแดงอมชมพู เหมาะกับระบบแจ้งเตือน/ตรวจสอบ',
      accent: '#E11D48',
      accentColor: '#E11D48',
    },
  ];

  getThemeOptions(): ThemePresetOption[] {
    return this.presetOptions;
  }

  applyTheme(
    themePreset?: string | null,
    themeAccentColor?: string | null,
    fallbackMode?: ThemeMode | null
  ): ThemeState {
    const state = this.normalize(themePreset, themeAccentColor, fallbackMode);
    const root = document.documentElement;
    const palette = this.createPalette(state.basePreset, state.mode);

    root.setAttribute('data-theme-preset', state.basePreset);
    root.setAttribute('data-theme-mode', state.mode);
    root.setAttribute('data-theme-key', state.themePreset);

    root.style.setProperty('--app-bg', palette.bg);
    root.style.setProperty('--app-bg-soft', palette.bgSoft);
    root.style.setProperty('--app-surface', palette.surface);
    root.style.setProperty('--app-surface-2', palette.surface2);
    root.style.setProperty('--app-surface-3', palette.surface3);
    root.style.setProperty('--app-text', palette.text);
    root.style.setProperty('--app-text-soft', palette.textSoft);
    root.style.setProperty('--app-text-mute', palette.textMute);
    root.style.setProperty('--app-border', palette.border);
    root.style.setProperty('--app-accent', state.themeAccentColor);
    root.style.setProperty('--app-accent-rgb', this.hexToRgbTriplet(state.themeAccentColor));
    root.style.setProperty('--app-success', '#16A34A');
    root.style.setProperty('--app-warning', '#F59E0B');
    root.style.setProperty('--app-danger', '#DC2626');
    root.style.setProperty('--app-info', '#0891B2');
    root.style.setProperty('--app-sidebar-bg', palette.sidebarBg);
    root.style.setProperty('--app-sidebar-text', palette.sidebarText);
    root.style.setProperty('--app-sidebar-mute', palette.sidebarMute);
    root.style.setProperty('--app-sidebar-active', palette.sidebarActive);
    root.style.setProperty('--app-header-bg', palette.headerBg);
    root.style.setProperty('--app-shadow-sm', palette.shadowSm);
    root.style.setProperty('--app-shadow', palette.shadow);

    localStorage.setItem(this.storagePresetKey, state.themePreset);
    localStorage.setItem(this.storageAccentKey, state.themeAccentColor);

    return state;
  }

  preview(basePreset: ThemeBasePreset, mode: ThemeMode, accent: string): ThemeState {
    return this.applyTheme(this.buildThemePreset(basePreset, mode), accent, mode);
  }

  resetTheme(): ThemeState {
    return this.applyTheme(
      this.buildThemePreset(this.defaultBasePreset, this.defaultMode),
      this.defaultAccentColor,
      this.defaultMode
    );
  }

  applyFromStorage(): ThemeState {
    return this.applyTheme(
      localStorage.getItem(this.storagePresetKey),
      localStorage.getItem(this.storageAccentKey)
    );
  }

  getStoredThemePreset(): string {
    return localStorage.getItem(this.storagePresetKey) || this.buildThemePreset(this.defaultBasePreset, this.defaultMode);
  }

  getStoredAccentColor(): string {
    return localStorage.getItem(this.storageAccentKey) || this.defaultAccentColor;
  }

  getStoredMode(): ThemeMode {
    return this.normalize(this.getStoredThemePreset(), this.getStoredAccentColor()).mode;
  }

  buildThemePreset(basePreset: ThemeBasePreset, mode: ThemeMode = this.defaultMode): string {
    return `${basePreset}_${mode}`;
  }

  toggleMode(): ThemeState {
    const current = this.normalize(this.getStoredThemePreset(), this.getStoredAccentColor());
    const nextMode: ThemeMode = current.mode === 'DARK' ? 'LIGHT' : 'DARK';
    return this.applyTheme(this.buildThemePreset(current.basePreset, nextMode), current.themeAccentColor, nextMode);
  }

  setPreset(basePreset: ThemeBasePreset): ThemeState {
    const current = this.normalize(this.getStoredThemePreset(), this.getStoredAccentColor());
    const accent = this.getPresetAccent(basePreset);
    return this.applyTheme(this.buildThemePreset(basePreset, current.mode), accent, current.mode);
  }

  normalize(
    themePreset?: string | null,
    themeAccentColor?: string | null,
    fallbackMode?: ThemeMode | null
  ): ThemeState {
    const parsed = this.parsePresetKey(themePreset, fallbackMode);
    const accent = this.normalizeAccent(themeAccentColor) || this.getPresetAccent(parsed.basePreset);

    return {
      basePreset: parsed.basePreset,
      mode: parsed.mode,
      themePreset: this.buildThemePreset(parsed.basePreset, parsed.mode),
      themeAccentColor: accent,
    };
  }

  getPresetAccent(basePreset: ThemeBasePreset | string): string {
    const parsed = this.parsePresetKey(basePreset, this.defaultMode);
    return this.presetOptions.find((x) => x.basePreset === parsed.basePreset)?.accent || this.defaultAccentColor;
  }

  /**
   * รองรับ key ที่มี underscore ในชื่อ theme เอง เช่น NGX_ADMIN_LIGHT
   * ของเดิม split('_')[0] จะอ่าน NGX_ADMIN_LIGHT เป็น NGX แล้วหลุด fallback
   */
  private parsePresetKey(
    themePreset?: string | null,
    fallbackMode?: ThemeMode | null
  ): { basePreset: ThemeBasePreset; mode: ThemeMode } {
    const raw = String(themePreset || '').trim().toUpperCase();
    const basePresetValues: ThemeBasePreset[] = [
      'NGX_ADMIN',
      'ZEDERE',
      'BACKEND',
      'OCEAN',
      'FOREST',
      'SUNSET',
      'MIDNIGHT',
      'SLATE',
      'ROSE',
    ];

    const basePreset =
      basePresetValues.find((base) => raw === base || raw.startsWith(`${base}_`)) || this.defaultBasePreset;

    const modeText = raw === basePreset ? '' : raw.substring(basePreset.length).replace(/^_/, '');
    let mode = (modeText || fallbackMode || this.defaultMode) as ThemeMode;

    if (!this.isMode(mode)) {
      mode = basePreset === 'MIDNIGHT' ? 'DARK' : this.defaultMode;
    }

    return { basePreset, mode };
  }

  private isBasePreset(value: string): value is ThemeBasePreset {
    return ['ZEDERE', 'NGX_ADMIN', 'BACKEND', 'OCEAN', 'FOREST', 'SUNSET', 'MIDNIGHT', 'SLATE', 'ROSE'].includes(value);
  }

  private isMode(value: string): value is ThemeMode {
    return value === 'LIGHT' || value === 'DARK';
  }

  private normalizeAccent(value?: string | null): string | null {
    const color = String(value || '').trim();
    return /^#([A-Fa-f0-9]{6})$/.test(color) ? color.toUpperCase() : null;
  }

  private hexToRgbTriplet(hex: string): string {
    const normalized = hex.replace('#', '');
    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  private createPalette(basePreset: ThemeBasePreset, mode: ThemeMode): Palette {
    const darkLike = mode === 'DARK' || basePreset === 'MIDNIGHT';

    if (darkLike) {
      return {
        bg: '#0B1020',
        bgSoft: '#10182B',
        surface: '#151D31',
        surface2: '#1A243A',
        surface3: '#202B44',
        text: '#EAF0FF',
        textSoft: '#AEBBD4',
        textMute: '#7F8EA8',
        border: 'rgba(148, 163, 184, 0.22)',
        sidebarBg: '#111827',
        sidebarText: '#F8FAFC',
        sidebarMute: '#9CA3AF',
        sidebarActive: 'rgba(var(--app-accent-rgb), 0.18)',
        headerBg: 'rgba(17, 24, 39, 0.86)',
        shadowSm: '0 8px 24px rgba(0, 0, 0, 0.24)',
        shadow: '0 22px 56px rgba(0, 0, 0, 0.34)',
      };
    }

    if (basePreset === 'ZEDERE') {
      return {
        bg: '#F8F5EF',
        bgSoft: '#EFE7DA',
        surface: '#FFFDF8',
        surface2: '#F7F0E5',
        surface3: '#F0E5D3',
        text: '#1C1917',
        textSoft: '#675A48',
        textMute: '#918575',
        border: 'rgba(92, 70, 38, 0.16)',
        sidebarBg: '#14110D',
        sidebarText: '#FFF7E6',
        sidebarMute: '#BDAF96',
        sidebarActive: 'rgba(var(--app-accent-rgb), 0.20)',
        headerBg: 'rgba(255, 253, 248, 0.90)',
        shadowSm: '0 8px 18px rgba(41, 30, 15, 0.08)',
        shadow: '0 20px 52px rgba(41, 30, 15, 0.13)',
      };
    }

    const lightMap: Record<ThemeBasePreset, [string, string]> = {
      ZEDERE: ['#F8F5EF', '#EFE7DA'],
      NGX_ADMIN: ['#F7F9FC', '#EDF1F7'],
      BACKEND: ['#F3FFFC', '#E0F7F2'],
      OCEAN: ['#F3FAFF', '#E7F5FF'],
      FOREST: ['#F4FAF6', '#EAF8EF'],
      SUNSET: ['#FFF7ED', '#FFEDD5'],
      MIDNIGHT: ['#0B1020', '#10182B'],
      SLATE: ['#F8FAFC', '#EEF2F7'],
      ROSE: ['#FFF5F7', '#FFE4EA'],
    };

    const [bg, bgSoft] = lightMap[basePreset] || lightMap.NGX_ADMIN;

    return {
      bg,
      bgSoft,
      surface: '#FFFFFF',
      surface2: '#F8FAFC',
      surface3: '#EEF2F7',
      text: '#1F2937',
      textSoft: '#64748B',
      textMute: '#94A3B8',
      border: 'rgba(15, 23, 42, 0.10)',
      sidebarBg: '#1A2138',
      sidebarText: '#F8FAFC',
      sidebarMute: '#AAB4C8',
      sidebarActive: 'rgba(var(--app-accent-rgb), 0.18)',
      headerBg: 'rgba(255, 255, 255, 0.90)',
      shadowSm: '0 6px 18px rgba(15, 23, 42, 0.07)',
      shadow: '0 18px 48px rgba(15, 23, 42, 0.11)',
    };
  }
}
