import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/modules/user/service/user.service';
import { VacancyPositionType, Qualification, TechnicalSkillType } from '../../enum/JobVacancy';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-vacancy-opening',
  templateUrl: './vacancy-opening.component.html',
  styleUrls: ['./vacancy-opening.component.css']
})
export class VacancyOpeningComponent {

  @ViewChild('fileInput') fileInput! : ElementRef;

  resumeFile: File | null = null;
  resumeUrl: string = '';
  progress: boolean = false;
  resumeFileName: string = '';

  selectedPositionType: VacancyPositionType | null = null;
  selectedTechnicalSkill: TechnicalSkillType | null = null;
  selectedQualification: Qualification | null = null;

  positionType: VacancyPositionType = VacancyPositionType.FullTime;
  qualificationType: Qualification = Qualification.MTech;
  technicalSkillType: TechnicalSkillType = TechnicalSkillType.Others;

  constructor(private userService: UserService, private renderer: Renderer2, private snackBar: MatSnackBar) { }

  selectFile() {
    this.fileInput.nativeElement.click();
  }

  setPositionType(value: number) {
    this.positionType = value;
  }

  setQualificationType(value: number) {
    this.qualificationType = value;
  }
  setTechnicalSkillsType(value: number) {
    this.technicalSkillType = value;
  }

  uploadResume(event: any){
    var files = event.target.files;
    const formData = new FormData();
    this.progress = true;
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
      this.resumeFileName = files[i].name;
    }
    this.userService.uploadResume(formData).subscribe((data: any) => {
      this.progress = false;
      if (data.length > 0) {
        this.resumeUrl = data[0];
      }
    })
  }

  applyForVacancy(){

    const name = (document.getElementById('name') as HTMLInputElement).value;
  const mobile = (document.getElementById('mobile') as HTMLInputElement).value;
  const aboutMe = (document.getElementById('aboutMe') as HTMLTextAreaElement).value;

    if (this.resumeUrl && name && mobile && aboutMe && this.qualificationType && this.positionType && this.technicalSkillType) {
          const vacancyData = {
            name: name,
            qualification: this.qualificationType,
            postionType: this.positionType,
            technicalSkill: this.technicalSkillType,
            mobileNo: mobile,
            resumeURL: this.resumeUrl,
            aboutMe: aboutMe,
          };


          this.userService.applyForVacancy(vacancyData).subscribe(response => {
            this.showNotification('Your application has been successfully submitted.');
          }, error => {
            this.showNotification('An error occur while submitting your application.');
          });
    } else {
      this.showNotification('Please fill in all the details and select a resume file.');
    }
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}
