import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class UpdateProfileComponent implements OnInit {
  profileForm!: FormGroup;
  originalData: any = {};
  phoneError = false;
  alertMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      address: [''],
      phone: ['']
    });

    this.loadProfile();
  }

  loadProfile() {
    const email = sessionStorage.getItem('user_email') || localStorage.getItem('user_email');

    if (!email) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(`http://127.0.0.1:5000/customer_dashboard/my_account?email=${email}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.originalData = response.customer;
            this.profileForm.patchValue(this.originalData);
          }
        }
      });
  }

  validatePhone() {
    const phone = this.profileForm.get('phone')?.value;
    this.phoneError = phone && phone.length > 10;
  }

  updateProfile() {
    if (this.phoneError) return;

    const updatedData = {
      email: this.originalData.email,
      address: this.profileForm.get('address')?.value,
      phone: this.profileForm.get('phone')?.value
    };

    this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/update_account', updatedData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.alertMessage = '🎉 Changes saved successfully!';
            setTimeout(() => this.alertMessage = '', 3000); // hide after 3s
          }
        }
      });
  }

  cancel() {
    this.profileForm.patchValue({
      address: this.originalData.address,
      phone: this.originalData.phone
    });
  }

  goHome() {
    this.router.navigate(['/client-dashboard']);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
