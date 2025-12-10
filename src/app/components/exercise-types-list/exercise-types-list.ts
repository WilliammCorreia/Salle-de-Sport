import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ExerciseTypeService } from '../../services/exercise-type.service';
import { AuthService } from '../../services/auth.service';
import { ExerciseType } from '../../models/exercise-type.model';

@Component({
  selector: 'app-exercise-types-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exercise-types-list.html',
  styleUrl: './exercise-types-list.css'
})
export class ExerciseTypesList implements OnInit {
  exerciseTypes: ExerciseType[] = [];
  loading = false;

  constructor(
    private exerciseTypeService: ExerciseTypeService,
    public authService: AuthService, // Public pour l'utiliser dans le HTML
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading = true;
    this.exerciseTypeService.getAll(1, 100).subscribe({
      next: (response) => {
        if (response.data) {
          this.exerciseTypes = (response.data as any).exerciceTypes || []; 
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.exerciseTypes = [];
      }
    });
  }

  createType(): void {
    this.router.navigate(['/exercise-types/new']);
  }

  editType(id: string): void {
    this.router.navigate(['/exercise-types/edit', id]);
  }

  deleteType(id: string): void {
    if (confirm('Supprimer ce type d\'exercice ?')) {
      this.exerciseTypeService.delete(id).subscribe(() => this.loadTypes());
    }
  }
}