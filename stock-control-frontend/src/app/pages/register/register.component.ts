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

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
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
      console.log('Registration data:', this.registerForm.value);
      this.registrationMessage = 'Registration successful!';
      this.registrationMessageClass = 'success';
      this.router.navigate(['/login']);
    } else {
      this.registrationMessage = 'Please fill all fields correctly.';
      this.registrationMessageClass = 'error';
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
