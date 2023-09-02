import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = "";
  phoneNumber: string = "";
  password: string = "";

  constructor(private userService: UserService, private router: Router, private dialogRef: MatDialogRef<LoginComponent>) { }
  signIn() {
    let payload = { userId: this.email, password: this.password };
    this.userService.login(payload).subscribe((data: any) => {
      console.log(data);
      localStorage.setItem("role", data.role);
      localStorage.setItem("authToken", data.authToken);
      localStorage.setItem("id", data.id);
      this.dialogRef.close();
      this.userService.setData("login");
      if (data.role == 'Admin')
        this.router.navigate(['/user/admin']);
      else this.router.navigate(['/user/account']);
    })
  }
}
