import { Component } from '@angular/core';
import { CommonService } from 'src/app/shared/service/common.service';
import { AdminDashboardService } from '../admin/service/admin-dashboard.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  messages: any[] = [];

  constructor(private commonService: CommonService, private AdminDashboardService: AdminDashboardService, private cdr: ChangeDetectorRef) { }

  cards: any = [];
  // searchCards: any = [1];
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

    // this.AdminDashboardService.searchResults$.subscribe((results) => {
    //   this.searchCards = results;
    // });

    this.AdminDashboardService.searchResults$.subscribe((results) => {
        this.cards = results;
        this.isLoading = false;
    });

  }

}
