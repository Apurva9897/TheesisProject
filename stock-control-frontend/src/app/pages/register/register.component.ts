import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  showConfirmPassword = false;
  passwordStrength = '';
  registrationMessage = '';
  registrationMessageClass = '';
  popupMessage = '';
  popupClass = '';
  showPopup = false;
  phoneLengthError = '';

  otpSent = false;
  otpVerified = false;
  otpValue = '';
  emailFieldDisabled = false;
  otpExpireTimer: any;
  resendButtonEnabled = false;
  serverOtpValue = '';
  minutes: number = 5;
seconds: number = 0;
timerInterval: any;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
    }, { 
      validators: this.passwordMatchValidator 
    });
    
    // Disable password fields initially until email is verified
    this.registerForm.get('password')?.disable();
    this.registerForm.get('confirmPassword')?.disable();
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  };

  checkPasswordStrength() {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      this.passwordStrength = 'strong';
    } else if (password.length >= 6) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'weak';
    }

    // Re-validate confirm password field when password changes
    if (this.registerForm.get('confirmPassword')?.value) {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  onRegister() {
    // Prevent registration if email is not verified
    if (!this.otpVerified) {
      this.registrationMessage = 'Please verify your email address first.';
      this.registrationMessageClass = 'alert alert-warning';
      return;
    }
    
    // Check if passwords match
    if (this.registerForm.hasError('passwordMismatch')) {
      this.registrationMessage = 'Passwords do not match.';
      this.registrationMessageClass = 'alert alert-danger';
      return;
    }

    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const submissionData = {
        ...formValue
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

  sendOTP() {
    const email = this.registerForm.get('email')?.value;
  
    if (!email) {
      this.registrationMessage = 'Please enter your email first.';
      this.registrationMessageClass = 'alert alert-danger';
      return;
    }
  
    this.http.post('http://127.0.0.1:5000/customer_dashboard/send_otp', { email })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.otpSent = true;
            this.registrationMessage = 'OTP sent to your email. Please verify.';
            this.registrationMessageClass = 'alert alert-info';
            this.emailFieldDisabled = true;
  
            // ✅ Capture server OTP secretly
            this.serverOtpValue = response.otp;
  
            // Disable email field
            this.registerForm.get('email')?.disable();
  
            this.startOtpTimer(); // start 5 min timer
          }
        },
        error: (error) => {
          console.error('OTP send error:', error);
          this.registrationMessage = 'Failed to send OTP.';
          this.registrationMessageClass = 'alert alert-danger';
        }
      });
  }
  

  // Verify OTP function
  verifyOTP() {
    const userOtp = this.otpValue;
  
    if (!userOtp || userOtp.length !== 6) {
      this.registrationMessage = 'Please enter a valid 6-digit OTP.';
      this.registrationMessageClass = 'alert alert-danger';
      return;
    }
  
    if (userOtp === this.serverOtpValue) {
      this.otpVerified = true;
      this.registrationMessage = '✅ Email verified! You can now complete registration.';
      this.registrationMessageClass = 'alert alert-success';
      clearTimeout(this.otpExpireTimer);
  
      // Enable password fields after email verification
      this.registerForm.get('password')?.enable();
      this.registerForm.get('confirmPassword')?.enable();
    } else {
      this.registrationMessage = 'Incorrect OTP.';
      this.registrationMessageClass = 'alert alert-danger';
    }
  }
  

  // Timer for 5 min OTP expiry
  startOtpTimer() {
    this.minutes = 4;
    this.seconds = 59;
    this.resendButtonEnabled = false;
  
    this.timerInterval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        clearInterval(this.timerInterval);
        this.resendButtonEnabled = true;
        this.registrationMessage = 'OTP expired. Please resend.';
        this.registrationMessageClass = 'alert alert-warning';
      }
    }, 1000);
  }
  
}