export interface AirtableConnectionSettings {
  systemLink: string;
  baseId: string;
  tableId: string;
  token: string;
}

export const AIRTABLE_SETTINGS_STORAGE_KEY = "zedere.airtable.connection.settings";

export const DEFAULT_AIRTABLE_SETTINGS: AirtableConnectionSettings = {
  systemLink: "https://api.airtable.com",
  baseId: "",
  tableId: "",
  token: "",
};

export function normalizeAirtableSettings(
  settings: Partial<AirtableConnectionSettings> | null | undefined
): AirtableConnectionSettings {
  return {
    systemLink: String(settings?.systemLink || DEFAULT_AIRTABLE_SETTINGS.systemLink)
      .trim()
      .replace(/\/+$/, ""),
    baseId: String(settings?.baseId || "").trim(),
    tableId: String(settings?.tableId || "").trim(),
    token: String(settings?.token || "").trim(),
  };
}

export function buildAirtableEndpoint(settings: AirtableConnectionSettings): string {
  const normalized = normalizeAirtableSettings(settings);

  if (!normalized.systemLink || !normalized.baseId || !normalized.tableId) {
    return "";
  }

  return `${normalized.systemLink}/v0/${normalized.baseId}/${normalized.tableId}`;
}
