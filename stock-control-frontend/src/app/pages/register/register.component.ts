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
  apiUrl: string = 'http://127.0.0.1:5000/auth/register';

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    const userData = {
        username: this.username,
        role: this.role,
        email: this.email,
        password: this.password,
        phone: this.phone,
        address: this.address  // Ensure phone field is added in UI
    };

    // ✅ Log the data before sending
    console.log("🚀 Sending registration data:", userData);

    this.http.post(this.apiUrl, userData).subscribe({
        next: (response: any) => {
            console.log("✅ Registration successful:", response);

            if (response.success) {
                alert('Registration Successful');
                if (this.role === 'admin' || this.role === 'staff') {
                    this.router.navigate(['/company-dashboard']);
                } else {
                    this.router.navigate(['/client-dashboard']);
                }
            } else {
                alert(response.message);
            }
        },
        error: (error) => {
            alert('Error registering user');
            console.error(error);
        }
    });
}

}
