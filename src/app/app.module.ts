import { AirtableProductMasterPageComponent } from "src/app/features/product-master/pages/airtable-product-master-page/airtable-product-master-page.component";
import { CommonModule } from "@angular/common";
import { ZEDERE_DEMO_MODE_PROVIDERS } from "./core/mock/zedere-demo-mode.provider";
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ApiTrafficInterceptor } from './core/interceptors/api-traffic.interceptor';

import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainMenuComponent } from './features/main-menu/main-menu.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChangePasswordComponent } from './features/profile/change-password/change-password.component';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users.component';
import { AdminPermissionsComponent } from './features/admin/admin-permissions/admin-permissions.component';
import { AuditLogsComponent } from './features/admin/audit-logs/audit-logs.component';
import { SystemHealthComponent } from './features/system/system-health/system-health.component';
import { ThemeSettingsComponent } from './features/settings/theme-settings/theme-settings/theme-settings.component';
import { AccessDeniedComponent } from './features/errors/access-denied/access-denied.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { WorkflowInboxComponent } from './features/workflow/workflow-inbox/workflow-inbox.component';
import { WorkflowMonitorComponent } from './features/workflow/workflow-monitor/workflow-monitor.component';
import { WorkflowDetailComponent } from './features/workflow/workflow-detail/workflow-detail.component';
import { WorkflowDefinitionsComponent } from './features/admin/workflow-definitions/workflow-definitions.component';
import { MiniProductionListComponent } from './features/production/mini-production-list/mini-production-list.component';
import { MiniProductionDetailComponent } from './features/production/mini-production-detail/mini-production-detail.component';
import { MiniProductionBoardComponent } from './features/production/mini-production-board/mini-production-board.component';

registerLocaleData(localeTh);

@NgModule({
  declarations: [
    AirtableProductMasterPageComponent,
    AppComponent,
    AppShellComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    MainMenuComponent,
    ProfileComponent,
    ChangePasswordComponent,
    AdminUsersComponent,
    AdminPermissionsComponent,
    AuditLogsComponent,
    SystemHealthComponent,
    ThemeSettingsComponent,
    AccessDeniedComponent,
    NotFoundComponent,
    WorkflowInboxComponent,
    WorkflowMonitorComponent,
    WorkflowDetailComponent,
    WorkflowDefinitionsComponent,
    MiniProductionListComponent,
    MiniProductionDetailComponent,
    MiniProductionBoardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,

    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  providers: [
    ...ZEDERE_DEMO_MODE_PROVIDERS,
    { provide: LOCALE_ID, useValue: 'th-TH' },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiTrafficInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
