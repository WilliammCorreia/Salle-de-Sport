import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Workout {
  _id: string;
  user: string;
  challenge?: string;
  gymHall?: string;
  date: string;
  duration: number;
  calories: number;
  exercises: Array<{
    exerciseType: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }>;
  notes?: string;
  intensity: 'faible' | 'modérée' | 'élevée' | 'maximale';
  mood: 'excellent' | 'bon' | 'moyen' | 'fatigué' | 'épuisé';
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutResponse {
  success: boolean;
  data: Workout | Workout[];
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  message?: string;
}

export interface WorkoutStats {
  success: boolean;
  data: {
    overall: {
      totalWorkouts: number;
      totalDuration: number;
      totalCalories: number;
      avgDuration: number;
      avgCalories: number;
    };
    byIntensity: Array<{ _id: string; count: number }>;
    byMonth: Array<{
      _id: { year: number; month: number };
      count: number;
      totalCalories: number;
      totalDuration: number;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

  getWorkouts(params?: any): Observable<WorkoutResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<WorkoutResponse>(this.apiUrl, { params: httpParams });
  }

  getWorkoutById(id: string): Observable<WorkoutResponse> {
    return this.http.get<WorkoutResponse>(`${this.apiUrl}/${id}`);
  }

  createWorkout(workout: Partial<Workout>): Observable<WorkoutResponse> {
    return this.http.post<WorkoutResponse>(this.apiUrl, workout);
  }

  updateWorkout(id: string, workout: Partial<Workout>): Observable<WorkoutResponse> {
    return this.http.put<WorkoutResponse>(`${this.apiUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<WorkoutResponse> {
    return this.http.delete<WorkoutResponse>(`${this.apiUrl}/${id}`);
  }

  getWorkoutStats(params?: any): Observable<WorkoutStats> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<WorkoutStats>(`${this.apiUrl}/stats/summary`, { params: httpParams });
  }
}
