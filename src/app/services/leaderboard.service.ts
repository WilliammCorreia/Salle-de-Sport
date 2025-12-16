import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  gymId?: string;
  name: string;
  email?: string;
  score: number;
  [key: string]: any;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  count: number;
  challengeId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  getUsersLeaderboard(params?: any): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/users`, { params: httpParams });
  }

  getGymsLeaderboard(limit?: number): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    if (limit) {
      httpParams = httpParams.set('limit', limit.toString());
    }
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/gyms`, { params: httpParams });
  }

  getChallengeLeaderboard(challengeId: string): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/challenges/${challengeId}`);
  }

  getUsersByChallengesCompleted(limit?: number): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    if (limit) {
      httpParams = httpParams.set('limit', limit.toString());
    }
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/challenges-completed`, { params: httpParams });
  }

  getUsersByBadges(limit?: number): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    if (limit) {
      httpParams = httpParams.set('limit', limit.toString());
    }
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/badges`, { params: httpParams });
  }
}
