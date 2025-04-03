import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  phone: string = ''; // ✅ Added phone property
  address: string = ''; // ✅ Added address property
  role: string = 'client'; // Default role is client
  registrationMessage: string = '';
  registrationMessageClass: string = '';
  popupMessage: string = '';
  popupClass: string = '';
  showPopup: boolean = false;
  apiUrl: string = 'http://127.0.0.1:5000/auth/register';

  constructor(private router: Router, private http: HttpClient) {}

  // ✅ Reusable function for popup
  showPopupMessage(message: string, type: 'success' | 'error') {
    this.popupMessage = message;
    this.popupClass = type === 'success' ? 'popup-success' : 'popup-error';
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 4000); // disappears after 4 seconds
  }
  onRegister() {
    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone,
      address: this.address,
    };
  
    this.http.post(this.apiUrl, newUser).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.registrationMessage = 'Registration Successful!';
          this.registrationMessageClass = 'success';
  
          // Optional: Clear form
          this.username = '';
          this.email = '';
          this.password = '';
          this.role = '';
          this.phone = '';
          this.address = '';
        } else {
          this.registrationMessage = 'Registration failed.';
          this.registrationMessageClass = 'error';
        }
      },
      error: (error) => {
        this.registrationMessage = error?.error?.message || 'Something went wrong';
        this.registrationMessageClass = 'error';
        console.error(error);
      }
    });
  }
  

goToLogin() {
    this.router.navigate(['/login']);
  }

}
