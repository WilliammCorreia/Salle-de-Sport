import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';
import { ExerciseType, CreateExerciseType } from '../models/exercise-type.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseTypeService {
  private readonly apiUrl = `${environment.apiUrl}/exercices-types`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10): Observable<ApiResponse<PaginatedResponse<ExerciseType[]>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ExerciseType[]>>>(this.apiUrl, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getById(id: string): Observable<ApiResponse<ExerciseType>> {
    return this.http.get<ApiResponse<ExerciseType>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateExerciseType): Observable<ApiResponse<ExerciseType>> {
    return this.http.post<ApiResponse<ExerciseType>>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateExerciseType>): Observable<ApiResponse<ExerciseType>> {
    return this.http.put<ApiResponse<ExerciseType>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}