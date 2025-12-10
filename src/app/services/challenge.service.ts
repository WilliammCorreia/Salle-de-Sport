import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/user.model';
import { Challenge, CreateChallenge, ChallengeFilters, ChallengeInvitation } from '../models/challenge.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // --- Gestion des Défis ---

  getChallenges(filters?: ChallengeFilters): Observable<ApiResponse<Challenge[]>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
      if (filters.minDuration) params = params.set('minDuration', filters.minDuration.toString());
      if (filters.maxDuration) params = params.set('maxDuration', filters.maxDuration.toString());
      if (filters.gymHall) params = params.set('gymHall', filters.gymHall);
      if (filters.exercicesTypes && filters.exercicesTypes.length > 0) {
          filters.exercicesTypes.forEach(id => {
              params = params.append('exercicesTypes', id);
          });
      }
    }

    return this.http.get<ApiResponse<Challenge[]>>(`${this.apiUrl}/challenges`, { params });
  }

  getById(id: string): Observable<ApiResponse<Challenge>> {
    return this.http.get<ApiResponse<Challenge>>(`${this.apiUrl}/challenges/${id}`);
  }

  create(data: CreateChallenge): Observable<ApiResponse<Challenge>> {
    return this.http.post<ApiResponse<Challenge>>(`${this.apiUrl}/challenges`, data);
  }

  update(id: string, data: Partial<CreateChallenge>): Observable<ApiResponse<Challenge>> {
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/challenges/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/challenges/${id}`);
  }

  // --- Partie Sociale (Invitations) ---

  inviteUser(challengeId: string, email: string): Observable<ApiResponse<ChallengeInvitation>> {
    return this.http.post<ApiResponse<ChallengeInvitation>>(`${this.apiUrl}/challenges/${challengeId}/invite`, { email });
  }

  getMyInvitations(): Observable<ApiResponse<ChallengeInvitation[]>> {
    // Cette route a été définie dans user.routes.js côté backend
    return this.http.get<ApiResponse<ChallengeInvitation[]>>(`${this.apiUrl}/users/me/invitations`);
  }

  join(challengeId: string): Observable<ApiResponse<Challenge>> {
    return this.http.post<ApiResponse<Challenge>>(`${this.apiUrl}/challenges/${challengeId}/join`, {});
  }

  respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): Observable<ApiResponse<ChallengeInvitation>> {
    return this.http.put<ApiResponse<ChallengeInvitation>>(`${this.apiUrl}/invitations/${invitationId}/respond`, { status });
  }
}