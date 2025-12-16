import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'defi' | 'entrainement' | 'social' | 'progression' | 'autre';
  rules: {
    type: 'challenges_completed' | 'workouts_count' | 'calories_burned' | 'streak_days' | 'score_reached' | 'custom';
    value?: number;
    customCondition?: string;
  };
  isActive: boolean;
  rarity: 'commun' | 'rare' | 'épique' | 'légendaire';
  scoreBonus: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeResponse {
  success: boolean;
  data: Badge | Badge[];
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private apiUrl = `${environment.apiUrl}/badges`;

  constructor(private http: HttpClient) {}

  getBadges(params?: any): Observable<BadgeResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<BadgeResponse>(this.apiUrl, { params: httpParams });
  }

  getBadgeById(id: string): Observable<BadgeResponse> {
    return this.http.get<BadgeResponse>(`${this.apiUrl}/${id}`);
  }

  createBadge(badge: Partial<Badge>): Observable<BadgeResponse> {
    return this.http.post<BadgeResponse>(this.apiUrl, badge);
  }

  updateBadge(id: string, badge: Partial<Badge>): Observable<BadgeResponse> {
    return this.http.put<BadgeResponse>(`${this.apiUrl}/${id}`, badge);
  }

  deleteBadge(id: string): Observable<BadgeResponse> {
    return this.http.delete<BadgeResponse>(`${this.apiUrl}/${id}`);
  }

  awardBadgeToUser(badgeId: string, userId: string): Observable<BadgeResponse> {
    return this.http.post<BadgeResponse>(`${this.apiUrl}/${badgeId}/award/${userId}`, {});
  }

  getUsersWithBadge(badgeId: string): Observable<BadgeResponse> {
    return this.http.get<BadgeResponse>(`${this.apiUrl}/${badgeId}/users`);
  }
}
