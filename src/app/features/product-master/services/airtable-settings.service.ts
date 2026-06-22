import { Injectable } from "@angular/core";

import {
  AIRTABLE_SETTINGS_STORAGE_KEY,
  AirtableConnectionSettings,
  DEFAULT_AIRTABLE_SETTINGS,
  buildAirtableEndpoint,
  normalizeAirtableSettings,
} from "../models/airtable-settings.model";

@Injectable({
  providedIn: "root",
})
export class AirtableSettingsService {
  load(): AirtableConnectionSettings {
    try {
      const raw = localStorage.getItem(AIRTABLE_SETTINGS_STORAGE_KEY);

      if (!raw) {
        return { ...DEFAULT_AIRTABLE_SETTINGS };
      }

      return normalizeAirtableSettings(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_AIRTABLE_SETTINGS };
    }
  }

  save(settings: AirtableConnectionSettings): AirtableConnectionSettings {
    const normalized = normalizeAirtableSettings(settings);
    localStorage.setItem(AIRTABLE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  clear(): AirtableConnectionSettings {
    localStorage.removeItem(AIRTABLE_SETTINGS_STORAGE_KEY);
    return { ...DEFAULT_AIRTABLE_SETTINGS };
  }

  endpoint(settings: AirtableConnectionSettings = this.load()): string {
    return buildAirtableEndpoint(settings);
  }

  isReady(settings: AirtableConnectionSettings = this.load()): boolean {
    const normalized = normalizeAirtableSettings(settings);
    return !!normalized.systemLink && !!normalized.baseId && !!normalized.tableId && !!normalized.token;
  }
}
