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
  selectedCategory: any;
  showSubcategories: boolean = false;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.getAllCategory();
  }

  toggleSubCategories(mainCategory: any) {
    if (this.selectedCategory === mainCategory.categoryName) {
      // If the same category is clicked again, hide the subcategories
      this.showSubcategories = false;
      this.selectedCategory = null;
    } else {
      this.selectedCategory = mainCategory.categoryName;
      this.commonService.getSubCategoryByCategoryId(mainCategory.id).subscribe((data: any) => {
        this.subCategories = data;
        this.showSubcategories = true; // Show the subcategories
      });
    }
  }

  getAllCategory() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategories = data;
    });
  }
}
