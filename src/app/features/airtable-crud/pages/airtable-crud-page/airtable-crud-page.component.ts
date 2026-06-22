import { Component, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";

import { AirtableRecord } from "src/app/features/airtable-crud/models/airtable-crud.model";
import { AirtableCrudService } from "src/app/features/airtable-crud/services/airtable-crud.service";

@Component({
  selector: "app-airtable-crud-page",
  templateUrl: "./airtable-crud-page.component.html",
  styleUrls: ["./airtable-crud-page.component.css"],
})
export class AirtableCrudPageComponent implements OnInit {
  loading = false;
  saving = false;
  deleting = false;

  records: AirtableRecord[] = [];
  filteredRecords: AirtableRecord[] = [];
  columns: string[] = [];

  selectedRecord: AirtableRecord | null = null;
  searchText = "";
  editorMode: "create" | "edit" = "create";
  fieldsJson = "{}";

  nextOffset: string | undefined;
  errorMessage = "";
  successMessage = "";

  constructor(private airtable: AirtableCrudService) {}

  ngOnInit(): void {
    this.load();
  }

  load(offset?: string): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.successMessage = "";

    this.airtable
      .list(offset)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.records = res.records || [];
          this.nextOffset = res.offset;
          this.columns = this.buildColumns(this.records);
          this.applyFilter();

          if (this.records.length > 0) {
            this.selectRecord(this.records[0]);
          } else {
            this.startCreate();
          }
        },
        error: (err) => {
          this.errorMessage = this.extractError(err);
        },
      });
  }

  reload(): void {
    this.selectedRecord = null;
    this.load();
  }

  loadNext(): void {
    if (this.nextOffset) {
      this.load(this.nextOffset);
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchText = input?.value || "";
    this.applyFilter();
  }

  onFieldsInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement | null;
    this.fieldsJson = textarea?.value || "";
  }

  applyFilter(): void {
    const keyword = String(this.searchText || "").trim().toLowerCase();

    if (!keyword) {
      this.filteredRecords = [...this.records];
      return;
    }

    this.filteredRecords = this.records.filter((record) => {
      const text = [
        record.id,
        record.createdTime,
        ...Object.keys(record.fields || {}),
        ...Object.values(record.fields || {}).map((value) => this.valueToText(value)),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }

  selectRecord(record: AirtableRecord): void {
    this.selectedRecord = record;
    this.editorMode = "edit";
    this.fieldsJson = JSON.stringify(record.fields || {}, null, 2);
    this.errorMessage = "";
    this.successMessage = "";
  }

  startCreate(): void {
    this.selectedRecord = null;
    this.editorMode = "create";
    this.fieldsJson = JSON.stringify(
      {
        TEST_ID: this.nextDemoId(),
        "SECRET CODE": "Yes! You are awesome!",
      },
      null,
      2
    );
    this.errorMessage = "";
    this.successMessage = "";
  }

  save(): void {
    if (this.saving) {
      return;
    }

    const fields = this.parseFields();
    if (!fields) {
      return;
    }

    this.saving = true;
    this.errorMessage = "";
    this.successMessage = "";

    const request$ =
      this.editorMode === "edit" && this.selectedRecord
        ? this.airtable.update(this.selectedRecord.id, fields)
        : this.airtable.create(fields);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (record) => {
        const index = this.records.findIndex((item) => item.id === record.id);

        if (index >= 0) {
          this.records[index] = record;
          this.successMessage = "Update success";
        } else {
          this.records = [record, ...this.records];
          this.successMessage = "Create success";
        }

        this.columns = this.buildColumns(this.records);
        this.applyFilter();
        this.selectRecord(record);
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
      },
    });
  }

  deleteSelected(): void {
    if (!this.selectedRecord || this.deleting) {
      return;
    }

    const id = this.selectedRecord.id;
    const ok = window.confirm(`Delete Airtable record ${id}?`);

    if (!ok) {
      return;
    }

    this.deleting = true;
    this.errorMessage = "";
    this.successMessage = "";

    this.airtable
      .delete(id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.records = this.records.filter((record) => record.id !== id);
          this.columns = this.buildColumns(this.records);
          this.applyFilter();
          this.successMessage = "Delete success";
          this.startCreate();
        },
        error: (err) => {
          this.errorMessage = this.extractError(err);
        },
      });
  }

  valueToText(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.valueToText(item)).join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  trackByRecordId(_: number, record: AirtableRecord): string {
    return record.id;
  }

  trackByColumn(_: number, column: string): string {
    return column;
  }

  private buildColumns(records: AirtableRecord[]): string[] {
    const set = new Set<string>();

    records.forEach((record) => {
      Object.keys(record.fields || {}).forEach((key) => set.add(key));
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private parseFields(): Record<string, any> | null {
    try {
      const parsed = JSON.parse(this.fieldsJson || "{}");

      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        this.errorMessage = "Fields JSON must be an object.";
        return null;
      }

      return parsed;
    } catch (err: any) {
      this.errorMessage = err?.message || "Invalid JSON.";
      return null;
    }
  }

  private extractError(err: any): string {
    return String(
      err?.error?.error?.message ||
        err?.error?.message ||
        err?.message ||
        "Airtable request failed."
    );
  }

  private nextDemoId(): string {
    const next = this.records.length + 1;
    return `${String(next).padStart(3, "0")}/06`;
  }
}
