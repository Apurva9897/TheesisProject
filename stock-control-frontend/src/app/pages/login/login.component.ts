import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';  // ✅ Add this
  password: string = '';
  loginMessage: string = '';
  loginMessageClass: string = '';
  popupMessage: string = '';
  popupClass: string = '';
  showPopup: boolean = false;
  apiUrl: string = 'http://127.0.0.1:5000/auth/login';

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

  onLogin() {
    const userData = { email: this.email, password: this.password };
  
    this.http.post(this.apiUrl, userData).subscribe({
        next: (response: any) => {
            if (response.success) {
                this.loginMessage = 'Login Successful!';
                this.loginMessageClass = 'success';
  
                if (response.role === 'admin' || response.role === 'staff') {
                    this.router.navigate(['/admin-dashboard']);
                } else if (response.role === 'client') {
                    this.router.navigate(['/client-dashboard']);
                } else {
                    this.loginMessage = 'Invalid Role';
                    this.loginMessageClass = 'error';
                }
            } else {
                this.loginMessage = 'Invalid Credentials';
                this.loginMessageClass = 'error';
            }
        },
        error: (error) => {
            this.loginMessage = error?.error?.message || 'Error connecting to server';
            this.loginMessageClass = 'error';
            console.error(error);
        }
    });
  }
  

  goToRegister() {
    this.router.navigate(['/register']); // Register Page Redirect
  }
}