import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class RegisterComponent {
  registerForm!: FormGroup;
  showPassword = false;
  passwordStrength = '';
  registrationMessage = '';
  registrationMessageClass = '';
  popupMessage = '';
  popupClass = '';
  showPopup = false;
  phoneLengthError = '';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      countryCode: ['+44', Validators.required],   // ✅ Add country code
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required]
    });
    
  }

  checkPasswordStrength() {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      this.passwordStrength = 'strong';
    } else if (password.length >= 6) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'weak';
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const submissionData = {
        ...formValue,
        phone: `${formValue.countryCode}${formValue.phone}`
      };

      this.http.post('http://127.0.0.1:5000/auth/register', submissionData)
        .subscribe({
          next: (response: any) => {
          if (response.success) {
            this.registrationMessage = 'Registration successful!';
            this.registrationMessageClass = 'success';
            this.showPopup = true; 
            setTimeout(() => {
              this.registrationMessage = '🎉 Registration Successful!';
              this.registrationMessageClass = 'alert alert-success alert-dismissible fade show';

            }, 100);
          } else {
            this.registrationMessage = 'Registration failed.';
            this.registrationMessageClass = 'error';
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.registrationMessage = 'Registration failed: ' + (error.error?.message || 'Server error');
          this.registrationMessageClass = 'error';
        }
      });
      
    } else {
      this.registrationMessage = 'Please fill all fields correctly.';
      this.registrationMessageClass = 'error';
    }
  }
  

  allowOnlyNumbers(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    const currentValue = this.registerForm.get('phone')?.value || '';
  
    // prevent non-digit input
    if (!/[0-9]/.test(inputChar)) {
      event.preventDefault();
    }
  
    // prevent input if more than 10 digits
    if (currentValue.length >= 10) {
      this.phoneLengthError = 'Phone number cannot exceed 10 digits';
      event.preventDefault();  // disallow further typing
    } else {
      this.phoneLengthError = '';  // clear error
    }
  }
  

  goToLogin() {
    this.router.navigate(['/login']);
  }

  dismissAlert() {
    this.registrationMessage = '';
    this.registrationMessageClass = '';
  }
  
}
