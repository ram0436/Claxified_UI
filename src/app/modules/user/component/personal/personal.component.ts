import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';


@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent {

  userData: any;

  constructor(private userService: UserService) { }
  ngOnInit() {
    if (localStorage.getItem("id") != null) {
      this.userService.getUserById(Number(localStorage.getItem("id"))).subscribe((userData: any) => {
        this.userData = userData[0];
      });
    }
  }
}
