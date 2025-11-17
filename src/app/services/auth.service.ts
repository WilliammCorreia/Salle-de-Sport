import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User, AuthResponse, ApiResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly isBrowser: boolean;

  constructor(private readonly http: HttpClient, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadStoredUser();
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  getMe(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data.user);
          if (this.isBrowser) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/update-password`, {
      currentPassword,
      newPassword,
    });
  }

  private setSession(authResult: { user: User; token: string }): void {
    if (this.isBrowser) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult.user));
    }
    this.currentUserSubject.next(authResult.user);
  }

  private loadStoredUser(): void {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super_admin';
  }

  isGymOwner(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'gym_owner' || user?.role === 'super_admin';
  }
}
