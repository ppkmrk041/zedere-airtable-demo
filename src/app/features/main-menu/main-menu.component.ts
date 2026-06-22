import { Component } from '@angular/core';

type MenuItem = {
  title: string;
  subtitle: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent {
  readonly items: MenuItem[] = [
    // {
    //   title: 'Dashboard',
    //   subtitle: 'ภาพรวมระบบ และทางลัดการใช้งานหลัก',
    //   route: '/dashboard',
    //   icon: 'bi-speedometer2',
    // },
    {
      title: 'ข้อมูลจาก Airtable',
      subtitle: 'ตั้งค่าการเชื่อมต่อ และจัดการข้อมูล เพิ่ม แก้ไข ลบ',
      route: '/product-master',
      icon: 'bi-table',
    },
    {
      title: 'ธีมและสีระบบ',
      subtitle: 'ปรับสี Theme และหน้าตาระบบตามผู้ใช้',
      route: '/settings/theme',
      icon: 'bi-palette-fill',
    },
    // {
    //   title: 'สิทธิการเข้าถึง',
    //   subtitle: 'จัดการ Role / Permission / Override',
    //   route: '/admin/permissions',
    //   icon: 'bi-shield-lock-fill',
    // },
    {
      title: 'โปรไฟล์ของฉัน',
      subtitle: 'ดูข้อมูลบัญชี และเปลี่ยนรหัสผ่าน',
      route: '/me/profile',
      icon: 'bi-person-circle',
    },
  ];
}
