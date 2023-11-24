import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FurnitureService } from '../../service/furniture.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-furniture-posts',
  templateUrl: './furniture-posts.component.html',
  styleUrls: ['./furniture-posts.component.css', '../../../moduleposts.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FurniturePostsComponent {

  category: string = "";
  subCategoryId: Number = 0;
  isLoading: boolean = true;
  showFilters: boolean = false;
  cards: any = [];
  subscription: any;
  actualCards: any;
  constructor(private route: ActivatedRoute, private commonService: CommonService, private cdr: ChangeDetectorRef,
    private furnitureService: FurnitureService) { }

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
  getPosts() {
    this.cards = [];
    this.furnitureService.getAllFurniturePosts().subscribe((data: any) => {
      this.actualCards = data;
      if (this.subCategoryId != 0)
        this.cards = this.actualCards.filter((card: any) => card.subCategoryId == this.subCategoryId && card.isVerified);
      else
        this.cards = data;
        this.cards = data.filter((card: any) => card.isVerified);
      this.isLoading = false;
      this.subCategoryId = 0;
    })
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onResetClicked() {
    this.showFilters = false;
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
