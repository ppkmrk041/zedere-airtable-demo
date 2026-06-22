# ZEDERE Airtable Professional Shell Patch
# Keeps existing shell/auth/header/sidebar/theme/profile/permission.
# Improves Airtable data page with modal create/edit/delete and friendly wording.

$ErrorActionPreference = "Stop"

function Log-Info($Message) { Write-Host "[ZEDERE] $Message" -ForegroundColor Cyan }
function Log-Warn($Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Log-Ok($Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Log-Error($Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }

$Root = (Get-Location).Path
$AngularJson = Join-Path $Root "angular.json"

if (!(Test-Path $AngularJson)) {
  Log-Error "angular.json not found. Run this patch from Angular project root."
  exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PayloadPath = Join-Path $ScriptDir "zedere-airtable-pro-shell-payload.json"

if (!(Test-Path $PayloadPath)) {
  Log-Error "zedere-airtable-pro-shell-payload.json not found."
  exit 1
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $Root ("zedere-airtable-pro-shell-backup-" + $Stamp)
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Backup-IfExists($RelativePath) {
  $FullPath = Join-Path $Root $RelativePath
  if (Test-Path $FullPath) {
    $BackupPath = Join-Path $BackupDir $RelativePath
    $BackupParent = Split-Path $BackupPath -Parent
    if (!(Test-Path $BackupParent)) {
      New-Item -ItemType Directory -Force -Path $BackupParent | Out-Null
    }
    Copy-Item $FullPath $BackupPath -Force
  }
}

function Decode-Base64Utf8($Base64Text) {
  $Bytes = [System.Convert]::FromBase64String($Base64Text)
  return [System.Text.Encoding]::UTF8.GetString($Bytes)
}

function Write-ZdFile($RelativePath, $Content) {
  $FullPath = Join-Path $Root $RelativePath
  $Parent = Split-Path $FullPath -Parent

  if (!(Test-Path $Parent)) {
    New-Item -ItemType Directory -Force -Path $Parent | Out-Null
  }

  Backup-IfExists $RelativePath
  [System.IO.File]::WriteAllText($FullPath, $Content, $Utf8NoBom)
  Log-Ok ("written " + $RelativePath)
}

function Ensure-AppModule-Declaration {
  $Rel = "src/app/app.module.ts"
  $Path = Join-Path $Root $Rel

  if (!(Test-Path $Path)) {
    Log-Warn "app.module.ts not found. Skipped declaration patch."
    return
  }

  $Text = Get-Content $Path -Raw
  $Original = $Text

  $ImportLine = 'import { AirtableProductMasterPageComponent } from "./features/product-master/pages/airtable-product-master-page/airtable-product-master-page.component";'

  if ($Text -notmatch "AirtableProductMasterPageComponent") {
    $Text = $ImportLine + [Environment]::NewLine + $Text
  }

  if ($Text -match "declarations\s*:\s*\[") {
    $DeclBlock = [regex]::Match($Text, "declarations\s*:\s*\[[\s\S]*?\]")
    if (!$DeclBlock.Success -or $DeclBlock.Value -notmatch "AirtableProductMasterPageComponent") {
      $Text = [regex]::Replace($Text, "declarations\s*:\s*\[", "declarations: [`r`n    AirtableProductMasterPageComponent,", 1)
    }
  }

  if ($Text -ne $Original) {
    Backup-IfExists $Rel
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
    Log-Ok "patched app.module.ts declaration"
  }
}

function Patch-AppShell-Menu {
  $Rel = "src/app/layout/app-shell/app-shell.component.ts"
  $Path = Join-Path $Root $Rel

  if (!(Test-Path $Path)) {
    Log-Warn "app-shell.component.ts not found. Sidebar menu not patched."
    return
  }

  $Text = Get-Content $Path -Raw
  $Original = $Text

  $Text = [regex]::Replace(
    $Text,
    "type\s+NavSection\s*=\s*[^;]+;",
    "type NavSection = 'CORE' | 'DATA' | 'ADMIN' | 'ACCOUNT' | 'SYSTEM';",
    1
  )

  $NewNavItems = @"
  readonly navItems: NavItem[] = [
    { label: 'Main Menu', subtitle: 'ศูนย์รวมเมนูหลัก', route: '/mainmenu', icon: 'bi-grid-1x2-fill', section: 'CORE' },
    { label: 'Dashboard', subtitle: 'ภาพรวมระบบ', route: '/dashboard', icon: 'bi-speedometer2', section: 'CORE', permissions: ['DASHBOARD_VIEW', 'SYSTEM_HEALTH_VIEW'] },

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
"@

  $Pattern = "readonly\s+navItems\s*:\s*NavItem\[\]\s*=\s*\[[\s\S]*?\];\s*readonly\s+sections\s*:\s*\{\s*key\s*:\s*NavSection\s*;\s*label\s*:\s*string\s*\}\[\]\s*=\s*\[[\s\S]*?\];"

  if ([regex]::IsMatch($Text, $Pattern)) {
    $Text = [regex]::Replace($Text, $Pattern, $NewNavItems, 1)
  } else {
    Log-Warn "navItems/sections pattern not found. Sidebar menu may need manual cleanup."
  }

  if ($Text -ne $Original) {
    Backup-IfExists $Rel
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
    Log-Ok "patched AppShell sidebar menu"
  }
}

function Patch-AuthInterceptor-Allow-Airtable {
  $Rel = "src/app/core/interceptors/auth.interceptor.ts"
  $Path = Join-Path $Root $Rel

  if (!(Test-Path $Path)) { return }

  $Text = Get-Content $Path -Raw
  if ($Text -match "api\.airtable\.com") { return }

  $Original = $Text
  $Old = "return url.startsWith(environment.actuatorURL) ||"
  $New = "return /^https:\/\/api\.airtable\.com\//i.test(url) || url.startsWith(environment.actuatorURL) ||"

  if ($Text.Contains($Old)) {
    $Text = $Text.Replace($Old, $New)
  } else {
    Log-Warn "auth interceptor skip pattern not found"
  }

  if ($Text -ne $Original) {
    Backup-IfExists $Rel
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
    Log-Ok "patched auth interceptor Airtable bypass"
  }
}

function Patch-MockInterceptor-Allow-Airtable {
  $Rel = "src/app/core/mock/zedere-mock-api.interceptor.ts"
  $Path = Join-Path $Root $Rel

  if (!(Test-Path $Path)) { return }

  $Text = Get-Content $Path -Raw
  if ($Text -match "api\.airtable\.com") { return }

  $Needle = "if (!environment.demoMode) {"
  $Insert = @"
    if (/^https:\/\/api\.airtable\.com\//i.test(req.url)) {
      return next.handle(req);
    }

"@

  $Index = $Text.IndexOf($Needle)
  if ($Index -ge 0) {
    $BraceEnd = $Text.IndexOf("}", $Index)
    if ($BraceEnd -ge 0) {
      Backup-IfExists $Rel
      $Text = $Text.Insert($BraceEnd + 1, "`r`n`r`n" + $Insert)
      [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
      Log-Ok "patched mock interceptor Airtable bypass"
    }
  }
}

Log-Info "Applying Airtable Professional Shell Patch"
Log-Info ("Project root: " + $Root)
Log-Info ("Backup dir: " + $BackupDir)

$PayloadRaw = Get-Content $PayloadPath -Raw -Encoding UTF8
$Payloads = $PayloadRaw | ConvertFrom-Json

foreach ($Item in $Payloads.PSObject.Properties) {
  Write-ZdFile $Item.Name (Decode-Base64Utf8 $Item.Value)
}

Ensure-AppModule-Declaration
Patch-AppShell-Menu
Patch-AuthInterceptor-Allow-Airtable
Patch-MockInterceptor-Allow-Airtable

Log-Ok "Airtable Professional Shell Patch completed."
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  npm start"
Write-Host ""
Write-Host "Open:" -ForegroundColor Cyan
Write-Host "  Main Menu -> ข้อมูลจาก Airtable"
Write-Host ""
Write-Host ("Backup created at: " + $BackupDir) -ForegroundColor Yellow
