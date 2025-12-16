import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChallengeProgress {
  _id: string;
  user: string;
  challenge: any;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  progression: number;
  startDate?: string;
  completionDate?: string;
  workouts: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressResponse {
  success: boolean;
  data: ChallengeProgress | ChallengeProgress[];
  count?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getChallengeProgress(challengeId: string): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.apiUrl}/challenges/${challengeId}/progress`);
  }

  startChallenge(challengeId: string): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(`${this.apiUrl}/challenges/${challengeId}/start`, {});
  }

  updateChallengeProgress(challengeId: string, data: any): Observable<ProgressResponse> {
    return this.http.put<ProgressResponse>(`${this.apiUrl}/challenges/${challengeId}/progress`, data);
  }

  completeChallenge(challengeId: string): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(`${this.apiUrl}/challenges/${challengeId}/complete`, {});
  }

  abandonChallenge(challengeId: string): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(`${this.apiUrl}/challenges/${challengeId}/abandon`, {});
  }

  getMyChallenges(status?: string): Observable<ProgressResponse> {
    const url = status
      ? `${this.apiUrl}/progress/my-challenges?status=${status}`
      : `${this.apiUrl}/progress/my-challenges`;
    return this.http.get<ProgressResponse>(url);
  }
}
