import { Component } from '@angular/core';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-post-menu',
  templateUrl: './post-menu.component.html',
  styleUrls: ['./post-menu.component.css']
})
export class PostMenuComponent {

  mainCategories: any = [];
  subCategories: any = [];
  selectedCategory : any ;
  showSubcategories: boolean = false;
  constructor(private commonService : CommonService) { }

  ngOnInit() {
    this.getAllCategory();
  }
  showSubCategories(mainCategory: any) {
    this.selectedCategory = mainCategory.categoryName;
    this.commonService.getSubCategoryByCategoryId(mainCategory.id).subscribe((data: any) => {
      this.subCategories = data;
    });
  }
  getAllCategory() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategories = data;
    });
  }

  hideSubCategories() {
    // When leaving the main category, hide the subcategories
    this.subCategories = [];
    this.showSubcategories = false; // Set to false to hide the subcategories
    this.selectedCategory = null;
  }
}
