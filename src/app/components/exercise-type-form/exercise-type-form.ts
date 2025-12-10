import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ExerciseTypeService } from '../../services/exercise-type.service';

@Component({
  selector: 'app-exercise-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exercise-type-form.html',
  styleUrl: './exercise-type-form.css'
})
export class ExerciseTypeForm implements OnInit {
  form: FormGroup;
  isEditMode = false;
  typeId: string | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private exerciseTypeService: ExerciseTypeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      muscleGroupsInput: ['', Validators.required] // On gère ça comme une string séparée par des virgules pour simplifier
    });
  }

  ngOnInit(): void {
    this.typeId = this.route.snapshot.paramMap.get('id');
    if (this.typeId) {
      this.isEditMode = true;
      this.loadType(this.typeId);
    }
  }

  loadType(id: string): void {
    this.exerciseTypeService.getById(id).subscribe({
      next: (response) => {
        if (response.data) {
          const data = response.data;
          this.form.patchValue({
            name: data.name,
            description: data.description,
            muscleGroupsInput: data.muscleGroups.join(', ')
          });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // Transformation de la string "Pecs, Bras" en tableau ["Pecs", "Bras"]
    const rawData = this.form.value;
    const muscleGroups = rawData.muscleGroupsInput.split(',').map((s: string) => s.trim()).filter((s: string) => s);

    const payload = {
      name: rawData.name,
      description: rawData.description,
      muscleGroups
    };

    const request$ = this.isEditMode && this.typeId
      ? this.exerciseTypeService.update(this.typeId, payload)
      : this.exerciseTypeService.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/exercise-types']),
      error: (err) => this.errorMessage = err.error?.message || 'Une erreur est survenue'
    });
  }
}