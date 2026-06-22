import { environment } from "src/environments/environment";

export const ZEDERE_DEMO_TOKEN = "DEMO_TOKEN_ZEDERE";

export const ZEDERE_DEMO_ROLES = [
  "ROLE_ADMIN",
  "ROLE_MANAGER",
  "ROLE_SALES",
  "ROLE_DESIGN",
  "ROLE_PRODUCTION",
  "ROLE_QC",
  "ROLE_PACKING",
  "ROLE_PREMIX",
];

export const ZEDERE_DEMO_PERMISSIONS = [
  "MAIN_MENU_VIEW",
  "DASHBOARD_VIEW",

  "PRODUCTION_JOB_VIEW",
  "PRODUCTION_JOB_CREATE",
  "PRODUCTION_JOB_UPDATE",
  "PRODUCTION_JOB_APPROVE",

  "MATERIAL_CONTROL_VIEW",
  "MATERIAL_CONTROL_ACTION",

  "QUALITY_CONTROL_VIEW",
  "QUALITY_CONTROL_ACTION",

  "PACKING_VIEW",
  "PACKING_ACTION",

  "PRODUCT_MASTER_VIEW",
  "PRODUCT_MASTER_CREATE",
  "PRODUCT_MASTER_UPDATE",

  "BOM_ROUTING_VIEW",
  "BOM_ROUTING_CREATE",
  "BOM_ROUTING_UPDATE",

  "WORKFLOW_VIEW",
  "WORKFLOW_ACTION",
  "WORKFLOW_APPROVE",

  "PREMIX_VIEW",
  "PREMIX_ACTION",
  "PREMIX_ADMIN",

  "USER_VIEW",
  "USER_MANAGE",
  "PERMISSION_VIEW",
  "PERMISSION_MANAGE",
];

export function seedZedereDemoSession(): void {
  if (!environment.demoMode) {
    return;
  }

  const hasToken = !!localStorage.getItem("token");

  if (hasToken) {
    return;
  }

  localStorage.setItem("token", ZEDERE_DEMO_TOKEN);
  localStorage.setItem("username", "admin");
  localStorage.setItem("displayName", "Zedere Demo Admin");
  localStorage.setItem("roles", JSON.stringify(ZEDERE_DEMO_ROLES));
  localStorage.setItem("permissions", JSON.stringify(ZEDERE_DEMO_PERMISSIONS));
}
