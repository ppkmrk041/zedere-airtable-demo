import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  readonly cards = [
    { label: 'Main Menu', value: 'พร้อมใช้', icon: 'bi-grid-1x2-fill' },
    { label: 'Airtable Data', value: 'ตั้งค่าเองได้', icon: 'bi-table' },
    { label: 'Theme', value: 'คงของเดิม', icon: 'bi-palette-fill' },
    { label: 'Profile', value: 'คงของเดิม', icon: 'bi-person-circle' },
  ];
}
