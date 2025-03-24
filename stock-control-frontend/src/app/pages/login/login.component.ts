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
  apiUrl: string = 'http://127.0.0.1:5000/auth/login';

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    const userData = { email: this.email, password: this.password };

    this.http.post(this.apiUrl, userData).subscribe({
        next: (response: any) => {
            if (response.success) {
                alert('Login Successful');

                // 🔹 FIX: Redirect based on role
                if (response.role === 'admin' || response.role === 'staff') {
                    this.router.navigate(['/admin-dashboard']); // Both roles go to admin dashboard
                } else if (response.role === 'client') {
                    this.router.navigate(['/client-dashboard']);
                } else {
                    alert('Invalid Role');
                }
            } else {
                alert('Invalid Credentials');
            }
        },
        error: (error) => {
            alert('Error connecting to server');
            console.error(error);
        }
    });
}

  goToRegister() {
    this.router.navigate(['/register']); // Register Page Redirect
  }
}