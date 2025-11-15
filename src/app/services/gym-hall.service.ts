import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GymHall } from '../models/gym-hall.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class GymHallService {
  private apiUrl = 'http://localhost:5000/api/gym-halls';

  constructor(private http: HttpClient) {}

  createGymHall(gymHallData: any): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.post<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}`, gymHallData);
  }

  getAllGymHalls(
    page = 1,
    limit = 10,
    filters?: any
  ): Observable<ApiResponse<{ gymHalls: GymHall[]; pagination: any }>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.city) params = params.set('city', filters.city);
      if (filters.activityType) params = params.set('activityType', filters.activityType);
      if (filters.owner) params = params.set('owner', filters.owner);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<{ gymHalls: GymHall[]; pagination: any }>>(`${this.apiUrl}`, {
      params,
    });
  }

  getGymHallById(id: string): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.get<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}/${id}`);
  }

  updateGymHall(id: string, gymHallData: any): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.put<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}/${id}`, gymHallData);
  }

  deleteGymHall(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  approveGymHall(id: string): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.put<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectGymHall(id: string): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.put<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}/${id}/reject`, {});
  }

  suspendGymHall(id: string): Observable<ApiResponse<{ gymHall: GymHall }>> {
    return this.http.put<ApiResponse<{ gymHall: GymHall }>>(`${this.apiUrl}/${id}/suspend`, {});
  }
}
