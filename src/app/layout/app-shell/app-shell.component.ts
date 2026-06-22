import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { ThemeBasePreset, ThemeMode, ThemeService } from '../../core/services/theme.service';

type NavSection = 'CORE' | 'DATA' | 'ADMIN' | 'ACCOUNT' | 'SYSTEM';

type NavItem = {
  label: string;
  subtitle: string;
  route: string;
  icon: string;
  section: NavSection;
  permissions?: string[];
};

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css'],
})
export class AppShellComponent implements OnInit {
  loggingOut = false;
  sidebarOpen = false;
  sidebarCollapsed = false;
  searchText = '';

  currentMode: ThemeMode = 'LIGHT';
  currentPreset: ThemeBasePreset = 'NGX_ADMIN';

  readonly quickPresets: ThemeBasePreset[] = ['NGX_ADMIN', 'BACKEND', 'ZEDERE', 'OCEAN', 'FOREST', 'SUNSET', 'MIDNIGHT'];

    readonly navItems: NavItem[] = [
    { label: 'Main Menu', subtitle: 'ศูนย์รวมเมนูหลัก', route: '/mainmenu', icon: 'bi-grid-1x2-fill', section: 'CORE' },
    // { label: 'Dashboard', subtitle: 'ภาพรวมระบบ', route: '/dashboard', icon: 'bi-speedometer2', section: 'CORE', permissions: ['DASHBOARD_VIEW', 'SYSTEM_HEALTH_VIEW'] },

    { label: 'ข้อมูลจาก Airtable', subtitle: 'เพิ่ม แก้ไข ลบ และตั้งค่าการเชื่อมต่อ', route: '/product-master', icon: 'bi-table', section: 'DATA' },

    { label: 'Permission Management', subtitle: 'Role / Permission / Override', route: '/admin/permissions', icon: 'bi-shield-lock-fill', section: 'ADMIN', permissions: ['ADMIN_PERMISSION_VIEW', 'ADMIN_ROLE_PERMISSION_VIEW', 'ADMIN_USER_PERMISSION_VIEW'] },

    { label: 'My Profile', subtitle: 'ข้อมูลบัญชีของฉัน', route: '/me/profile', icon: 'bi-person-circle', section: 'ACCOUNT', permissions: ['PROFILE_VIEW'] },
    { label: 'Change Password', subtitle: 'เปลี่ยนรหัสผ่าน', route: '/me/change-password', icon: 'bi-key-fill', section: 'ACCOUNT', permissions: ['PROFILE_PASSWORD_CHANGE'] },

    { label: 'Theme Settings', subtitle: 'ปรับสีและหน้าตาระบบ', route: '/settings/theme', icon: 'bi-palette-fill', section: 'SYSTEM', permissions: ['PROFILE_EDIT'] },
  ];

  readonly sections: { key: NavSection; label: string }[] = [
    { key: 'CORE', label: 'Workspace' },
    { key: 'DATA', label: 'Airtable Data' },
    { key: 'ADMIN', label: 'Administration' },
    { key: 'ACCOUNT', label: 'Account' },
    { key: 'SYSTEM', label: 'System' },
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = this.themeService.applyFromStorage();
    this.currentMode = state.mode;
    this.currentPreset = state.basePreset;
  }

  get user(): any {
    return this.authService.getStoredUser();
  }

  get displayName(): string {
    const u = this.user || {};
    return u.fullName || u.displayName || u.name || u.username || 'Zedere User';
  }

  get userSubTitle(): string {
    const u = this.user || {};
    return u.email || u.username || u.role || 'ERP Operator';
  }

  get userInitial(): string {
    return this.displayName.trim().substring(0, 1).toUpperCase() || 'Z';
  }

  get visibleNavItems(): NavItem[] {
    const q = this.searchText.trim().toLowerCase();

    return this.navItems
      .filter((item) => this.canSee(item))
      .filter((item) => {
        if (!q) return true;
        return `${item.label} ${item.subtitle} ${item.section}`.toLowerCase().includes(q);
      });
  }

  itemsBySection(section: NavSection): NavItem[] {
    return this.visibleNavItems.filter((item) => item.section === section);
  }

  hasSection(section: NavSection): boolean {
    return this.itemsBySection(section).length > 0;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMode(): void {
    const state = this.themeService.toggleMode();
    this.currentMode = state.mode;
    this.currentPreset = state.basePreset;
  }

  setPreset(basePreset: ThemeBasePreset): void {
    const state = this.themeService.setPreset(basePreset);
    this.currentMode = state.mode;
    this.currentPreset = state.basePreset;
  }

  openRoute(): void {
    this.closeSidebarOnMobile();
  }

  logout(): void {
    if (this.loggingOut) return;

    this.loggingOut = true;

    this.authService
      .logout()
      .pipe(finalize(() => (this.loggingOut = false)))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => {
          this.authService.forceLogout(false);
          this.router.navigate(['/login']);
        },
      });
  }

  @HostListener('window:resize')
  closeSidebarOnDesktop(): void {
    if (window.innerWidth >= 1024) {
      this.sidebarOpen = false;
    }
  }

  private closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  private canSee(item: NavItem): boolean {
    if (!item.permissions || item.permissions.length === 0) return true;
    return this.authService.hasAnyPermission(item.permissions);
  }
}
