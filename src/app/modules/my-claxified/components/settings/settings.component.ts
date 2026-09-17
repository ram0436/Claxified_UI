import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/modules/user/service/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isUploadingPhoto = false;
  isEditing = false;
  userId = 0;

  /** Raw record as returned by GET User/{id} — kept so we always PUT back
   * the full object (userImageList, role, flags, etc.) and not a partial one. */
  userData: any = null;

  defaultAvatar =
    'https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg';

  /** Editable copy — only these fields are changed by the form. */
  form = {
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    watsAppNo: '',
    aboutMe: '',
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.loadUser();
  }

  loadUser(): void {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.userData = Array.isArray(res) ? res[0] : res;
        this.syncFormFromUserData();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private syncFormFromUserData(): void {
    this.form = {
      firstName: this.userData?.firstName || '',
      lastName: this.userData?.lastName || '',
      email: this.userData?.email || '',
      mobileNo: this.userData?.mobileNo || '',
      watsAppNo: this.userData?.watsAppNo || '',
      aboutMe: this.userData?.aboutMe || '',
    };
  }

  get profileImageUrl(): string {
    const images = this.userData?.userImageList;
    if (images && images.length > 0) {
      return images[images.length - 1].imageURL;
    }
    return this.defaultAvatar;
  }

  get initials(): string {
    const name = `${this.form.firstName} ${this.form.lastName}`.trim();
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('') || 'U'
    );
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.syncFormFromUserData();
    this.isEditing = false;
  }

  onPhotoSelected(event: any): void {
    const files = event.target?.files;
    if (!files || !files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    this.isUploadingPhoto = true;
    this.userService.uploadProfilePicture(formData).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const imageUrl = data[0];
          this.userData.userImageList = this.userData.userImageList || [];
          this.userData.userImageList.push({
            id: 0,
            imageId: 'st',
            imageURL: imageUrl,
            usersId: this.userId,
          });
          this.userService.updateUser(this.userData).subscribe({
            next: () => {
              this.isUploadingPhoto = false;
            },
            error: () => {
              this.isUploadingPhoto = false;
            },
          });
        } else {
          this.isUploadingPhoto = false;
        }
      },
      error: () => {
        this.isUploadingPhoto = false;
      },
    });
  }

  saveChanges(): void {
    if (!this.userData) return;

    const payload = {
      ...this.userData,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      mobileNo: this.form.mobileNo,
      watsAppNo: this.form.watsAppNo,
      aboutMe: this.form.aboutMe,
    };

    this.isSaving = true;
    this.userService.updateUser(payload).subscribe({
      next: () => {
        this.userData = payload;
        this.isSaving = false;
        this.isEditing = false;
        localStorage.setItem('firstName', this.form.firstName);
      },
      error: () => {
        this.isSaving = false;
        alert('Could not save changes. Please try again.');
      },
    });
  }
}
