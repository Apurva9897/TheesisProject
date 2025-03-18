import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../app.config';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {} // ✅ No deprecation issue

  registerUser(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  loginUser(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}

