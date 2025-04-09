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
    const email = sessionStorage.getItem('user_email') || localStorage.getItem('user_email'); // assuming you saved email on login

    if (!email) {
      alert('No user found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(`http://127.0.0.1:5000/customer_dashboard/my_account?email=${email}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.originalData = response.customer;
            this.profileForm.patchValue({
              name: this.originalData.name,
              email: this.originalData.email,
              address: this.originalData.address,
              phone: this.originalData.phone
            });
          } else {
            alert('Failed to load profile.');
          }
        },
        error: () => {
          alert('Error loading profile.');
        }
      });
  }

  updateProfile() {
    const email = this.originalData.email;

    const updatedData = {
      email: email,
      address: this.profileForm.get('address')?.value,
      phone: this.profileForm.get('phone')?.value
    };

    this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/update_account', updatedData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Profile updated successfully.');
            this.router.navigate(['/client-dashboard']); // ✅ redirect back to dashboard after updating
          } else {
            alert('Profile update failed.');
          }
        },
        error: () => {
          alert('Error updating profile.');
        }
      });
  }

  cancel() {
    this.profileForm.patchValue({
      address: this.originalData.address,
      phone: this.originalData.phone
    });
  }
}
