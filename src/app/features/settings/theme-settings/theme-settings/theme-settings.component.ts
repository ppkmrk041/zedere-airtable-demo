import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { MeResponse, MeUpdateRequest } from '../../../../core/models/user.model';
import { MeService } from '../../../../core/services/me.service';
import {
  ThemeBasePreset,
  ThemeMode,
  ThemeService,
} from '../../../../core/services/theme.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';

@Component({
  selector: 'app-theme-settings',
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.css'],
})
export class ThemeSettingsComponent implements OnInit {
  form!: FormGroup;
  me: MeResponse | null = null;

  loading = false;
  saving = false;

  readonly presets = this.themeService.presetOptions;
  readonly modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'LIGHT', label: 'Light', icon: 'bi-brightness-high' },
    { value: 'DARK', label: 'Dark', icon: 'bi-moon-stars' },
  ];

  readonly accentOptions = [
    '#2563EB',
    '#16A34A',
    '#EA580C',
    '#6366F1',
    '#475569',
    '#E11D48',
    '#0891B2',
    '#7C3AED',
  ];

  constructor(
    private fb: FormBuilder,
    private meService: MeService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const current = this.themeService.normalize(
      this.themeService.getStoredThemePreset(),
      this.themeService.getStoredAccentColor()
    );

    this.form = this.fb.group({
      basePreset: [current.basePreset, [Validators.required]],
      mode: [current.mode, [Validators.required]],
      themeAccentColor: [
        current.themeAccentColor,
        [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6})$/)],
      ],
    });

    this.form.valueChanges.subscribe(() => this.previewTheme());
    this.loadMe();
  }

  get basePreset(): ThemeBasePreset {
    return this.form.get('basePreset')?.value as ThemeBasePreset;
  }

  get mode(): ThemeMode {
    return this.form.get('mode')?.value as ThemeMode;
  }

  get accent(): string {
    return String(this.form.get('themeAccentColor')?.value || '#2563EB').toUpperCase();
  }

  get themePresetForSave(): string {
    return this.themeService.buildThemePreset(this.basePreset, this.mode);
  }

  selectPreset(value: ThemeBasePreset | string): void {
    const basePreset = String(value).split('_')[0].toUpperCase() as ThemeBasePreset;

    this.form.patchValue(
      {
        basePreset,
        themeAccentColor: this.themeService.getPresetAccent(basePreset),
      },
      { emitEvent: true }
    );
  }

  selectMode(mode: ThemeMode): void {
    this.form.patchValue({ mode }, { emitEvent: true });
  }

  selectAccent(color: string): void {
    this.form.patchValue({ themeAccentColor: color.toUpperCase() }, { emitEvent: true });
  }

  loadMe(): void {
    if (this.loading) return;

    this.loading = true;

    this.meService
      .me()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (me) => {
          this.me = me;

          const state = this.themeService.normalize(me.themePreset, me.themeAccentColor);

          this.form.patchValue(
            {
              basePreset: state.basePreset,
              mode: state.mode,
              themeAccentColor: state.themeAccentColor,
            },
            { emitEvent: true }
          );
        },
        error: (err: unknown) => {
          Swal.fire({
            icon: 'error',
            title: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ',
            text: extractErrorMessage(err),
            confirmButtonText: 'ตกลง',
          });
        },
      });
  }

  previewTheme(): void {
    if (!this.form || this.form.invalid) return;
    this.themeService.preview(this.basePreset, this.mode, this.accent);
  }

  resetDefault(): void {
    this.form.patchValue(
      {
        basePreset: this.themeService.defaultBasePreset,
        mode: this.themeService.defaultMode,
        themeAccentColor: this.themeService.defaultAccentColor,
      },
      { emitEvent: true }
    );
  }

  save(): void {
    if (!this.me || this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: MeUpdateRequest = {
      fullName: this.me.fullName,
      email: this.me.email,
      themePreset: this.themePresetForSave,
      themeAccentColor: this.accent,
    };

    this.saving = true;

    this.meService
      .updateMe(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (me) => {
          this.me = me;
          this.themeService.applyTheme(me.themePreset, me.themeAccentColor, this.mode);

          Swal.fire({
            icon: 'success',
            title: 'บันทึก Theme สำเร็จ',
            text: 'ระบบจะใช้ Theme นี้ในครั้งถัดไปโดยอัตโนมัติ',
            timer: 1600,
            showConfirmButton: false,
          });
        },
        error: (err: unknown) => {
          Swal.fire({
            icon: 'error',
            title: 'บันทึก Theme ไม่สำเร็จ',
            text: extractErrorMessage(err),
            confirmButtonText: 'ตกลง',
          });
        },
      });
  }

  trackByPreset(_index: number, item: { value: string }): string {
    return item.value;
  }

  trackByMode(_index: number, item: { value: string }): string {
    return item.value;
  }

  trackByColor(_index: number, item: string): string {
    return item;
  }
}
