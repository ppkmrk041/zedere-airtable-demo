import { Component, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import Swal from "sweetalert2";

import { AirtableRecord } from "../../models/airtable-crud.model";
import { AirtableConnectionSettings } from "../../models/airtable-settings.model";
import { AirtableCrudService } from "../../services/airtable-crud.service";
import { AirtableSettingsService } from "../../services/airtable-settings.service";

type RecordModalMode = "none" | "create" | "edit" | "delete";

@Component({
  selector: "app-airtable-product-master-page",
  templateUrl: "./airtable-product-master-page.component.html",
  styleUrls: ["./airtable-product-master-page.component.css"],
})
export class AirtableProductMasterPageComponent implements OnInit {
  loading = false;
  saving = false;
  deleting = false;

  settings: AirtableConnectionSettings = this.settingsService.load();

  records: AirtableRecord[] = [];
  filteredRecords: AirtableRecord[] = [];
  selectedRecord: AirtableRecord | null = null;

  readonly displayColumns = ["TEST_ID", "SECRET CODE"];

  searchText = "";
  nextOffset: string | undefined;

  modalMode: RecordModalMode = "none";
  modalRecord: AirtableRecord | null = null;

  testIdValue = "";
  secretCodeValue = "";

  errorMessage = "";
  successMessage = "";

  constructor(
    private airtable: AirtableCrudService,
    public settingsService: AirtableSettingsService,
  ) {}

  ngOnInit(): void {
    if (this.settingsService.isReady(this.settings)) {
      this.load();
    } else {
      this.errorMessage = "กรุณาตั้งค่าการเชื่อมต่อ Airtable ก่อนเริ่มใช้งาน";
    }
  }

  get endpointPreview(): string {
    return (
      this.settingsService.endpoint(this.settings) ||
      "ยังไม่ได้ระบุ Base ID / Table ID"
    );
  }

  get modalTitle(): string {
    if (this.modalMode === "create") return "เพิ่มข้อมูลใหม่";
    if (this.modalMode === "edit") return "แก้ไขข้อมูล";
    if (this.modalMode === "delete") return "ยืนยันการลบข้อมูล";
    return "";
  }

  onSettingInput(key: keyof AirtableConnectionSettings, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.settings = {
      ...this.settings,
      [key]: input?.value || "",
    };
  }

  saveSettings(): void {
    this.settings = this.settingsService.save(this.settings);
    this.errorMessage = "";
    this.successMessage = "บันทึกการเชื่อมต่อ Airtable แล้ว";

    Swal.fire({
      icon: "success",
      title: "บันทึกการตั้งค่าแล้ว",
      text: "ระบบพร้อมเชื่อมต่อ Airtable",
      timer: 1400,
      showConfirmButton: false,
    });

    if (this.settingsService.isReady(this.settings)) {
      this.reload();
    }
  }

  clearSettings(): void {
    const ok = window.confirm(
      "ต้องการล้างการตั้งค่า Airtable ที่บันทึกไว้ในเครื่องนี้ใช่ไหม?",
    );
    if (!ok) return;

    this.settings = this.settingsService.clear();
    this.records = [];
    this.filteredRecords = [];
    this.selectedRecord = null;
    this.nextOffset = undefined;
    this.successMessage = "ล้างการตั้งค่าแล้ว";
    this.errorMessage = "กรุณาตั้งค่าการเชื่อมต่อ Airtable ก่อนเริ่มใช้งาน";
  }

  load(offset?: string): void {
    if (this.loading) return;

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
          this.applyFilter();

          if (!this.selectedRecord && this.records.length > 0) {
            this.selectedRecord = this.records[0];
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

  applyFilter(): void {
    const keyword = String(this.searchText || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      this.filteredRecords = [...this.records];
      return;
    }

    this.filteredRecords = this.records.filter((record) => {
      const text = [
        record.id,
        record.createdTime,
        this.getField(record, "TEST_ID"),
        this.getField(record, "SECRET CODE"),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }

  selectRecord(record: AirtableRecord): void {
    this.selectedRecord = record;
  }

  openCreate(): void {
    this.modalMode = "create";
    this.modalRecord = null;

    this.testIdValue = this.generateNextTestId();
    this.secretCodeValue = "";

    this.errorMessage = "";
    this.successMessage = "";
  }

  openEdit(record: AirtableRecord): void {
    this.modalMode = "edit";
    this.modalRecord = record;
    this.selectedRecord = record;

    this.testIdValue = this.getField(record, "TEST_ID");
    this.secretCodeValue = this.getField(record, "SECRET CODE");

    this.errorMessage = "";
    this.successMessage = "";
  }

  openDelete(record: AirtableRecord): void {
    this.modalMode = "delete";
    this.modalRecord = record;
    this.selectedRecord = record;

    this.testIdValue = this.getField(record, "TEST_ID");
    this.secretCodeValue = this.getField(record, "SECRET CODE");

    this.errorMessage = "";
    this.successMessage = "";
  }

  closeModal(force = false): void {
    if (!force && (this.saving || this.deleting)) return;

    this.modalMode = "none";
    this.modalRecord = null;
    this.testIdValue = "";
    this.secretCodeValue = "";
  }

  onSecretCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.secretCodeValue = input?.value || "";
  }

  saveRecord(): void {
    if (this.saving || this.modalMode === "delete") return;

    const testId = String(this.testIdValue || "").trim();
    const secretCode = String(this.secretCodeValue || "").trim();

    if (!testId) {
      this.errorMessage = "ไม่พบ TEST_ID";
      return;
    }

    if (!secretCode) {
      this.errorMessage = "กรุณากรอก SECRET CODE";
      return;
    }

    const excludeRecordId =
      this.modalMode === "edit" ? this.modalRecord?.id : undefined;

    if (this.isDuplicateTestId(testId, excludeRecordId)) {
      this.errorMessage = `TEST_ID ${testId} มีอยู่แล้ว ระบบไม่อนุญาตให้ซ้ำ`;
      Swal.fire({
        icon: "warning",
        title: "TEST_ID ซ้ำ",
        text: `มี TEST_ID ${testId} อยู่ในข้อมูลแล้ว`,
      });
      return;
    }

    const fields = {
      TEST_ID: testId,
      "SECRET CODE": secretCode,
    };

    this.saving = true;
    this.errorMessage = "";
    this.successMessage = "";

    const request$ =
      this.modalMode === "edit" && this.modalRecord
        ? this.airtable.update(this.modalRecord.id, fields)
        : this.airtable.create(fields);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (record) => {
        const index = this.records.findIndex((item) => item.id === record.id);

        if (index >= 0) {
          this.records[index] = record;
          this.successMessage = "บันทึกการแก้ไขเรียบร้อย";
        } else {
          this.records = [record, ...this.records];
          this.successMessage = "เพิ่มข้อมูลใหม่เรียบร้อย";
        }

        this.applyFilter();
        this.selectedRecord = record;

        this.saving = false;
        this.closeModal(true);

        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: "ข้อมูลถูกบันทึกลง Airtable แล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        Swal.fire({
          icon: "error",
          title: "บันทึกไม่สำเร็จ",
          text: this.errorMessage,
        });
      },
    });
  }

  confirmDelete(): void {
    if (!this.modalRecord || this.deleting) return;

    const id = this.modalRecord.id;

    this.deleting = true;
    this.errorMessage = "";
    this.successMessage = "";

    this.airtable
      .delete(id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.records = this.records.filter((record) => record.id !== id);
          this.filteredRecords = this.filteredRecords.filter(
            (record) => record.id !== id,
          );
          this.selectedRecord = this.records[0] || null;
          this.successMessage = "ลบข้อมูลเรียบร้อย";

          this.deleting = false;
          this.closeModal(true);

          Swal.fire({
            icon: "success",
            title: "ลบข้อมูลแล้ว",
            timer: 1300,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          this.errorMessage = this.extractError(err);
          Swal.fire({
            icon: "error",
            title: "ลบไม่สำเร็จ",
            text: this.errorMessage,
          });
        },
      });
  }

  getField(record: AirtableRecord | null | undefined, key: string): string {
    if (!record) return "";
    return this.valueToText(record.fields?.[key]);
  }

  valueToText(value: any): string {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value))
      return value.map((item) => this.valueToText(item)).join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  trackByRecordId(_: number, record: AirtableRecord): string {
    return record.id;
  }

  private isDuplicateTestId(testId: string, excludeRecordId?: string): boolean {
    const normalized = String(testId || "")
      .trim()
      .toLowerCase();

    return this.records.some((record) => {
      if (excludeRecordId && record.id === excludeRecordId) return false;
      return (
        this.getField(record, "TEST_ID").trim().toLowerCase() === normalized
      );
    });
  }

  private generateNextTestId(): string {
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

    const existingNumbers = this.records
      .map((record) => this.getField(record, "TEST_ID"))
      .map((value) => {
        const match = String(value || "").match(/^(\d+)\/(\d{2})$/);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => Number.isFinite(value) && value > 0);

    let nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    let nextId = `${String(nextNumber).padStart(3, "0")}/${currentMonth}`;

    while (this.isDuplicateTestId(nextId)) {
      nextNumber++;
      nextId = `${String(nextNumber).padStart(3, "0")}/${currentMonth}`;
    }

    return nextId;
  }

  private extractError(err: any): string {
    return String(
      err?.error?.error?.message ||
        err?.error?.message ||
        err?.message ||
        "ไม่สามารถเชื่อมต่อ Airtable ได้",
    );
  }
}
