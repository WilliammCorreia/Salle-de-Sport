import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { ExerciseTypeService } from '../../services/exercise-type.service';
import { GymHallService } from '../../services/gym-hall.service';
import { AuthService } from '../../services/auth.service';
import { ExerciseType } from '../../models/exercise-type.model';
import { GymHall } from '../../models/gym-hall.model';

@Component({
  selector: 'app-challenge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './challenge-form.html',
  styleUrl: './challenge-form.css'
})
export class ChallengeForm implements OnInit {
  form: FormGroup;
  isEditMode = false;
  challengeId: string | null = null;
  availableEquipment: string[] = [];
  
  // Listes pour les selects
  exerciseTypes: ExerciseType[] = [];
  myGymHalls: GymHall[] = [];
  
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private challengeService: ChallengeService,
    private exerciseTypeService: ExerciseTypeService,
    private gymHallService: GymHallService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['perte_poids', Validators.required],
      difficulty: ['intermédiaire', Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      gymHall: [null], // Optionnel
      equipment: this.fb.array([]),
      exercises: this.fb.array([], Validators.required) // Au moins un exercice
    });
    
  }

  ngOnInit(): void {
    // 1. Charger les données nécessaires (Types d'exos & Salles du propriétaire)
    this.loadDependencies();

    this.form.get('gymHall')?.valueChanges.subscribe(gymId => {
      this.updateAvailableEquipment(gymId);
    });

    // 2. Vérifier si on est en édition
    this.challengeId = this.route.snapshot.paramMap.get('id');
    if (this.challengeId) {
      this.isEditMode = true;
      this.loadChallenge(this.challengeId);
    } else {
      // En création, on ajoute une ligne d'exercice vide par défaut
      this.addExercise();
    }
  }

  loadDependencies(): void {
    // Charger tous les types d'exercices pour le dropdown
    this.exerciseTypeService.getAll(1, 1000).subscribe(res => {
      if(res.data) {
        this.exerciseTypes = (res.data as any).exerciceTypes || [];
      }
    });

    // Si c'est un propriétaire, charger ses salles
    if (this.authService.isGymOwner()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.gymHallService.getAllGymHalls(1, 100, { owner: currentUser._id }).subscribe(res => {
          if(res.data) this.myGymHalls = res.data.gymHalls;
        });
      }
    }
  }

  updateAvailableEquipment(gymId: string | null): void {
    this.availableEquipment = [];
    
    if (gymId) {
      const selectedGym = this.myGymHalls.find(g => g._id === gymId);
      if (selectedGym && selectedGym.equipment) {
        // On extrait juste les noms des équipements
        this.availableEquipment = selectedGym.equipment.map(e => e.name);
      }
    }
    
    (this.form.get('equipment') as FormArray).clear();
  }

  // NOUVELLE MÉTHODE : Gestion des checkboxes
  onEquipmentChange(event: any, equipmentName: string): void {
    const equipmentArray = this.form.get('equipment') as FormArray;
    
    if (event.target.checked) {
      equipmentArray.push(this.fb.control(equipmentName));
    } else {
      const index = equipmentArray.controls.findIndex(x => x.value === equipmentName);
      if (index >= 0) equipmentArray.removeAt(index);
    }
  }

  // NOUVELLE MÉTHODE : Vérifier si une case est cochée (utile pour l'édition)
  isEquipmentSelected(equipmentName: string): boolean {
    const equipmentArray = this.form.get('equipment') as FormArray;
    return equipmentArray.value.includes(equipmentName);
  }

  // --- Gestion du FormArray (Exercices Dynamiques) ---

  get exercisesControls() {
    return (this.form.get('exercises') as FormArray).controls;
  }

  addExercise(data?: any): void {
    const exerciseGroup = this.fb.group({
      exerciseType: [data ? (data.exerciseType._id || data.exerciseType) : '', Validators.required],
      sets: [data ? data.sets : 3, [Validators.required, Validators.min(1)]],
      reps: [data ? data.reps : 10, [Validators.required, Validators.min(1)]],
      restTime: [data ? data.restTime : 60, [Validators.required, Validators.min(0)]]
    });
    (this.form.get('exercises') as FormArray).push(exerciseGroup);
  }

  removeExercise(index: number): void {
    (this.form.get('exercises') as FormArray).removeAt(index);
  }

  // --- Chargement et Soumission ---

  loadChallenge(id: string): void {
    this.challengeService.getById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const c = res.data;

          const gymId = c.gymHall ? (typeof c.gymHall === 'object' ? c.gymHall._id : c.gymHall) : null;
          this.updateAvailableEquipment(gymId as string);

          this.form.patchValue({
            title: c.title,
            description: c.description,
            category: c.category,
            difficulty: c.difficulty,
            duration: c.duration,
            gymHall: c.gymHall ? (typeof c.gymHall === 'object' ? c.gymHall._id : c.gymHall) : null
          });

          if (c.equipment) {
            const equipmentArray = this.form.get('equipment') as FormArray;
            c.equipment.forEach((eq: string) => {
               equipmentArray.push(this.fb.control(eq));
            });
          }
          
          // Peupler les exercices
          c.exercises.forEach(ex => this.addExercise(ex));
        }
      },
      error: (err) => this.errorMessage = "Impossible de charger le défi"
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;
    
    // Nettoyage: si gymHall est "null" (string) ou vide, on met null
    if (!payload.gymHall) payload.gymHall = undefined;

    const request$ = this.isEditMode && this.challengeId
      ? this.challengeService.update(this.challengeId, payload)
      : this.challengeService.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/challenges']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        // Si c'est une erreur de validation équipement (Code 403), elle s'affichera ici
      }
    });
  }
}