import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../services/challenge.service';
import { ExerciseTypeService } from '../../services/exercise-type.service'; // <--- Nouvel import
import { Challenge, ChallengeFilters } from '../../models/challenge.model';
import { GymHall } from '../../models/gym-hall.model';
import { ExerciseType } from '../../models/exercise-type.model'; // <--- Nouvel import

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './challenges-list.html',
  styleUrl: './challenges-list.css'
})
export class ChallengesList implements OnInit {
  challenges: Challenge[] = [];
  exerciseTypes: ExerciseType[] = []; // Liste pour le select
  loading = false;
  
  // Variables liées aux champs du formulaire (ngModel)
  selectedDifficulty = '';
  selectedCategory = '';
  selectedExerciseType = ''; // ID du type d'exo sélectionné
  minDuration: number | null = null;
  maxDuration: number | null = null;

  filters: ChallengeFilters = {};

  constructor(
    private challengeService: ChallengeService,
    private exerciseTypeService: ExerciseTypeService // <--- Injection
  ) {}

  ngOnInit(): void {
    this.loadDependencies();
    this.loadChallenges();
  }

  loadDependencies(): void {
    // On charge la liste des types d'exercices pour le filtre
    this.exerciseTypeService.getAll(1, 100).subscribe(res => {
      if (res.data) {
        // Attention au nom de la propriété renvoyée par le backend (comme vu précédemment)
        this.exerciseTypes = (res.data as any).exerciceTypes || [];
      }
    });
  }

  loadChallenges(): void {
    this.loading = true;
    
    // 1. Réinitialisation des filtres
    this.filters = {};

    // 2. Application des critères si présents
    if (this.selectedDifficulty) this.filters.difficulty = this.selectedDifficulty;
    
    // Note: Le backend attend un tableau d'IDs pour exercicesTypes
    if (this.selectedExerciseType) {
      this.filters.exercicesTypes = [this.selectedExerciseType];
    }

    if (this.minDuration) this.filters.minDuration = this.minDuration;
    if (this.maxDuration) this.filters.maxDuration = this.maxDuration;

    // 3. Appel API
    this.challengeService.getChallenges(this.filters).subscribe({
      next: (response) => {
        if (response.data) {
          this.challenges = response.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getGymHallName(gymHall: GymHall | string | null | undefined): string {
    if (!gymHall) return 'Communautaire';
    if (typeof gymHall === 'string') return 'Salle inconnue';
    return gymHall.name;
  }
}