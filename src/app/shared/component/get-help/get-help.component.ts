import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-get-help',
  templateUrl: './get-help.component.html',
  styleUrls: ['./get-help.component.css']
})

export class GetHelpComponent {
  activeTab: string = ''; // Variable to store the active tab label

  constructor(
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const tabParam = params['tab'];
      this.activeTab = tabParam ? tabParam.toLowerCase() : '';
    });
  }

  onTabChange(event: any): void {
    const selectedTabLabel = event.tab.textLabel.toLowerCase();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: selectedTabLabel },
      queryParamsHandling: 'merge',
    });
  }

  getTabIndex(){
    const tabName = this.activatedRoute.snapshot.queryParamMap.get('tab');
    switch (tabName) {
      case 'about':
        return 0;
      case 'policies':
        return 1;
      case 'safety':
        return 2;
      case 'premium service':
        return 3;
      case 'contact us':
        return 4;
      default:
        return 0; // Default to the first tab if no or invalid tab name in the URL
    }
  }
}
