import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, ApiResponse } from '../models/user.model';
import { UpdateUser } from '../models/user.model';
import { UserFilters } from '../models/filters.model';
import { Pagination } from '../models/pagination.model';
import { UserStats } from '../models/user-stats.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getAllUsers(
    page = 1,
    limit = 10,
    filters?: UserFilters
  ): Observable<ApiResponse<{ users: User[]; pagination: Pagination }>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (filters) {
      if (filters.role) params = params.set('role', filters.role);
      if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<{ users: User[]; pagination: Pagination }>>(`${this.apiUrl}`, {
      params,
    });
  }

  getUserById(id: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, userData: UpdateUser): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(`${this.apiUrl}/${id}`, userData);
  }

  deactivateUser(id: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activateUser(id: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(`${this.apiUrl}/${id}/activate`, {});
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  updateUserRole(id: string, role: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(`${this.apiUrl}/${id}/role`, { role });
  }

  getUserStats(id: string): Observable<ApiResponse<{ stats: UserStats }>> {
    return this.http.get<ApiResponse<{ stats: UserStats }>>(`${this.apiUrl}/${id}/stats`);
  }
}
