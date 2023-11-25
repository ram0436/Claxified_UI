import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/service/common.service';
import { GadgetService } from '../../service/gadget.service';

@Component({
  selector: 'app-gadget-posts',
  templateUrl: './gadget-posts.component.html',
  styleUrls: ['./gadget-posts.component.css', '../../../moduleposts.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GadgetPostsComponent {

  category: string = "";
  subCategoryId: Number = 0;
  isLoading: boolean = true;
  showFilters: boolean = false;
  cards: any = [];
  subscription: any;
  actualCards: any;
  constructor(private route: ActivatedRoute, private commonService: CommonService, private cdr: ChangeDetectorRef,
    private gadgetService: GadgetService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isLoading = true;
      this.category = params['type'];
      if (params['sub'] != undefined)
        this.subCategoryId = Number(params['sub']);
      this.getPosts();
    });
    this.subscription = this.commonService.getData().subscribe((data: any) => {
      this.isLoading = true;
      setTimeout(() => this.filterPosts(data), 500);
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onResetClicked() {
    this.showFilters = false;
  }

  getPosts() {
    this.cards = [];
    this.gadgetService.getAllGadgetPosts().subscribe((data: any) => {
      this.actualCards = data;
      if (this.subCategoryId != 0) {
        this.cards = this.actualCards.filter((card: any) => card.subCategoryId == this.subCategoryId && card.isVerified === true);
      } else {
        this.cards = this.actualCards.filter((card: any) => card.isVerified === true);
      }
      this.isLoading = false;
      this.subCategoryId = 0;
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  filterPosts(data: any) {
    const filterObj: { [key: string]: { operator: string; value: any } } = {};
    Object.keys(data).forEach(key => {
      if (data[key] != null && data[key] != "") {
        if (key == 'price')
          filterObj[key] = { operator: 'between', value: data[key] }
        else if (key == 'state' || key == 'subCategoryId' || key == 'city' || key == 'nearBy')
          filterObj[key] = { operator: '==', value: data[key] };
        else
          filterObj[key] = { operator: 'includes', value: data[key] };
      }
    });
    const filteredData = this.actualCards.filter((item: any) =>
      Object.entries(filterObj).every(([field, condition]) => {
        const { operator, value } = condition;
        const itemValue = item[field];

        if (Array.isArray(itemValue) && operator === 'includes') {
          return itemValue.some(v => value.includes(v));
        } else {
          switch (operator) {
            case '==':
              return item[field] === value;
            case '<=':
              return item[field] <= value;
            case 'includes':
              return value.includes(itemValue);
            case 'between':
              return value[0] <= itemValue && value[1] >= itemValue;
            default:
              return true;
          }
        }
      })
    );
    this.cards = [];
    this.cards = filteredData;
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
