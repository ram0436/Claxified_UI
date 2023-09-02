import { Component } from '@angular/core';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private commonService: CommonService) { }

  cards: any = [];
  currentDate: Date = new Date();
  isLoading: Boolean = true;
  ngOnInit(): void {
    this.commonService.getAllItems().subscribe((data: any) => {
      this.cards = data;
      this.isLoading = false;
    })
  }
}
