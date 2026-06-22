import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';

import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainMenuComponent } from './features/main-menu/main-menu.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChangePasswordComponent } from './features/profile/change-password/change-password.component';
import { AdminPermissionsComponent } from './features/admin/admin-permissions/admin-permissions.component';
import { ThemeSettingsComponent } from './features/settings/theme-settings/theme-settings/theme-settings.component';
import { AccessDeniedComponent } from './features/errors/access-denied/access-denied.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { AirtableProductMasterPageComponent } from './features/product-master/pages/airtable-product-master-page/airtable-product-master-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'mainmenu', component: MainMenuComponent, title: 'Main Menu' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },

      {
        path: 'product-master',
        component: AirtableProductMasterPageComponent,
        title: 'ข้อมูลจาก Airtable',
      },
      { path: 'airtable-data', redirectTo: 'product-master', pathMatch: 'full' },
      { path: 'airtable-crud', redirectTo: 'product-master', pathMatch: 'full' },

      { path: 'me/profile', component: ProfileComponent, title: 'My Profile' },
      { path: 'profile', redirectTo: 'me/profile', pathMatch: 'full' },
      { path: 'me/change-password', component: ChangePasswordComponent, title: 'Change Password' },

      {
        path: 'admin/permissions',
        component: AdminPermissionsComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: ['ADMIN_PERMISSION_VIEW', 'ADMIN_ROLE_PERMISSION_VIEW', 'ADMIN_USER_PERMISSION_VIEW'],
        },
        title: 'Permission Management',
      },
      { path: 'permission-management', redirectTo: 'admin/permissions', pathMatch: 'full' },

      { path: 'settings/theme', component: ThemeSettingsComponent, title: 'Theme & Appearance' },
      { path: 'theme', redirectTo: 'settings/theme', pathMatch: 'full' },
      { path: 'theme-settings', redirectTo: 'settings/theme', pathMatch: 'full' },

      // ตัดงาน Production / Master Data / Workflow อื่นออกจาก demo scope
      { path: 'production', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'production/:any', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'material-control', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'quality-control', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'packing', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'bom-routing', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'workflow', redirectTo: 'mainmenu', pathMatch: 'full' },
      { path: 'workflow/:any', redirectTo: 'mainmenu', pathMatch: 'full' },
    ],
  },

  { path: '403', component: AccessDeniedComponent, title: 'ไม่มีสิทธิ์เข้าถึง' },
  { path: '404', component: NotFoundComponent, title: 'ไม่พบหน้าที่ต้องการ' },
  { path: '**', redirectTo: '404', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
