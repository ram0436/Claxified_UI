import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { PropertyService } from '../../service/property.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-property-posts',
  templateUrl: './property-posts.component.html',
  styleUrls: ['./property-posts.component.css', '../../../moduleposts.component.css']
})
export class PropertyPostsComponent {

  category: string = "";
  subCategoryId: Number = 0;
  isLoading: boolean = true;
  cards: any = [];
  subscription: any;
  actualCards: any;
  constructor(private route: ActivatedRoute, private commonService: CommonService, private cdr: ChangeDetectorRef,
    private propertyService: PropertyService) { }
    
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
  // getPosts() {
  //   this.cards = [];
  //   this.propertyService.getAllPropertyPosts().subscribe((data: any) => {
  //     this.actualCards = data;
  //     if (this.subCategoryId != 0){
  //       this.cards = this.actualCards.filter((card: any) => card.subCategoryId == this.subCategoryId).map((card: any) => ({
  //         ...card,
  //         title: this.truncateTitle(card.title)
  //       }));
  //     }
  //     else{
  //       this.cards = this.actualCards.map((card: any) => ({
  //         ...card,
  //         title: this.truncateTitle(card.title)
  //       }));
  //     }
        
  //     this.isLoading = false;
  //     this.subCategoryId = 0;
  //   })
  // }

  getPosts() {
    this.cards = [];
    this.propertyService.getAllPropertyPosts().subscribe((data: any) => {
      this.actualCards = data;
      if (this.subCategoryId != 0){
        this.cards = this.actualCards.filter((card: any) => card.subCategoryId == this.subCategoryId);
        // this.truncateTitle(this.cards.title);
      }
      else
        this.cards = data;
      this.isLoading = false;
      this.subCategoryId = 0;
    })
  }

  truncateTitle(title: string, maxLength: number = 25): string {
    if (title.length <= maxLength) {
      return title;
    } else {
      return title.substring(0, maxLength) + '...';
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  filterPosts(data: any) {
    const filterObj: { [key: string]: { operator: string; value: any } } = {};
    Object.keys(data).forEach(key => {
      if (data[key] != null && data[key] != "") {
        if (key == 'price' || key == 'superBuildUpArea' || key == 'plotArea')
          filterObj[key] = { operator: 'between', value: data[key] }
        else if (key == 'state' || key == 'subCategoryId' || key == 'city' || key == 'nearBy' || key == 'bedrooms' || key == 'bathrooms' || key == 'bachelorAllowed')
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
