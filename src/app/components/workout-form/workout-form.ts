import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService, Workout } from '../../services/workout.service';
import { ChallengeService } from '../../services/challenge.service';
import { ExerciseTypeService } from '../../services/exercise-type.service';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-form.html'
})
export class WorkoutFormComponent implements OnInit {
  workout: Partial<Workout> = {
    date: new Date().toISOString().split('T')[0],
    duration: 30,
    calories: 0,
    exercises: [],
    intensity: 'modérée',
    mood: 'moyen',
    notes: ''
  };

  challenges: any[] = [];
  exerciseTypes: any[] = [];
  loading = false;
  error: string | null = null;

  intensities = ['faible', 'modérée', 'élevée', 'maximale'];
  moods = ['excellent', 'bon', 'moyen', 'fatigué', 'épuisé'];

  constructor(
    private workoutService: WorkoutService,
    private challengeService: ChallengeService,
    private exerciseTypeService: ExerciseTypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
    this.loadExerciseTypes();
  }

  loadChallenges(): void {
    this.challengeService.getChallenges().subscribe({
      next: (response) => {
        this.challenges = Array.isArray(response.data) ? response.data : [];
      },
      error: (err) => console.error('Erreur chargement défis', err)
    });
  }

  loadExerciseTypes(): void {
    this.exerciseTypeService.getAll(1, 100).subscribe({
      next: (response: any) => {
        this.exerciseTypes = Array.isArray(response.data.exerciceTypes) ? response.data.exerciceTypes : [];
        console.log(this.exerciseTypes)
        console.log(response)
      },
      error: (err: any) => console.error('Erreur chargement types exercices', err)
    });
  }

  addExercise(): void {
    this.workout.exercises!.push({
      exerciseType: '',
      sets: 3,
      reps: 10
    });
  }

  removeExercise(index: number): void {
    this.workout.exercises!.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.workout.exercises || this.workout.exercises.length === 0) {
      alert('Veuillez ajouter au moins un exercice');
      return;
    }

    this.loading = true;
    this.error = null;

    this.workoutService.createWorkout(this.workout).subscribe({
      next: () => {
        alert('Séance enregistrée avec succès !');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'enregistrement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
