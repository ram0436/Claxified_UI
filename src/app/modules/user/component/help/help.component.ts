import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent {

  constructor(private commonService: CommonService,private router : Router,private elementRef: ElementRef) { }

}
