import { Component } from '@angular/core';
import { CommonService } from 'src/app/shared/service/common.service';
import { AdminDashboardService } from '../admin/service/admin-dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  messages: any[] = [];

  constructor(private commonService: CommonService, private AdminDashboardService: AdminDashboardService) { }

  cards: any = [];
  currentDate: Date = new Date();
  isLoading: Boolean = true;
  ngOnInit(): void {
    this.commonService.getAllItems().subscribe((data: any) => {
      this.cards = data;
      this.isLoading = false;
    })

    this.AdminDashboardService.getDashboardMessage().subscribe(
      (data: any[]) => {
        this.messages = data;
      },
      (error: any) => {
      }
    );

  }
}
