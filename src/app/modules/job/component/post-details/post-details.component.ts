import { Component } from '@angular/core';
import { JobService } from '../../service/job.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { SalaryPeriod } from 'src/app/shared/enum/SalaryPeriod';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css', '../../../module.component.css']
})
export class PostDetailsComponent {

  postDetails: any;
  post: any;
  imagesList: any = [];
  isLoading: boolean = true;
  currentDate: Date = new Date();
  imageIndex: number = 0;
  relatedPosts: any = [
    { title: "Iphonr 10", price: 15000, state: "Telangana", city: "Hyderabad", nearBy: "Erragadda", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 11", price: 25000, state: "Telangana", city: "Hyderabad", nearBy: "Moosapet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 12", price: 35000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 13", price: 45000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 14", price: 55000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 15", price: 65000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
  ];
  itemsPerPage = 4;
  currentPage = 0;

  isZoomed: boolean = false;

  salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
    label: key,
    id: SalaryPeriod[key],
  }));
  
  constructor(private jobService: JobService, private route: ActivatedRoute, private router: Router,) { }

  ngOnInit() {
    var tableRefGuid;
    this.route.paramMap.subscribe((params) => {
      tableRefGuid = params.get('id');
    });
    if (tableRefGuid != null) {
      this.getSportPost(tableRefGuid);
    }
  }
  
  zoomIn() {
    this.isZoomed = !this.isZoomed;

    // Toggle a class to style the expanded image
    const imgElement = document.querySelector('.postImgCont');
    if (imgElement) {
      imgElement.classList.toggle('zoomed');
    }
  }

  closeZoom() {
    this.isZoomed = false;
    const imgElement = document.querySelector('.postImgCont');
    if (imgElement) {
      imgElement.classList.remove('zoomed');
    }
  }

  goBack() {
    this.router.navigate(['/Jobs/view-posts'], {
      queryParams: {
        type: 'job',
        sub: 18
      }
    });
  }
  getSportPost(guid: any) {
    this.jobService.getJobPostByGuid(guid).subscribe((data: any) => {
      this.postDetails = data[0];
      this.isLoading = false;
      this.imagesList = this.postDetails.jobImageList;
    });
  }
  formatDate(date: any): any {
    const inputDate: Date = new Date(date);
    const daysAgo = moment(this.currentDate).diff(inputDate, 'days');

    if (daysAgo >= 0 && daysAgo <= 7) {
      if (daysAgo === 0) {
        return 'Today';
      } else if (daysAgo === 1) {
        return 'Yesterday';
      } else {
        return daysAgo + ' days ago';
      }
    } else {
      return moment(inputDate).format('MMM DD');
    }
  }
  showPrevious() {
    this.imageIndex = this.imageIndex - 1;
  }
  showNext() {
    this.imageIndex = this.imageIndex + 1;
  }
  handleNext(): void {
    if (this.currentPage < Math.ceil(this.relatedPosts.length / this.itemsPerPage) - 1) {
      this.currentPage++;
    }
  }

  handlePrev(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get displayedItems(): any[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.relatedPosts.slice(start, end);
  }
  getSalaryPeriod(id: number) {
    let selectedSalaryPeriod = this.salaryPeriods.filter(salaryPeriod => Number(salaryPeriod.id) == id);
    if (selectedSalaryPeriod.length > 0)
        return selectedSalaryPeriod[0].label;
    return "";
}
}
