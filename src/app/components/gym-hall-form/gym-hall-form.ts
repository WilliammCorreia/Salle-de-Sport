import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GymHallService } from '../../services/gym-hall.service';

@Component({
  selector: 'app-gym-hall-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gym-hall-form.html',
  styleUrl: './gym-hall-form.css',
})
export class GymHallForm implements OnInit {
  gymHallForm: FormGroup;
  isEditMode = false;
  gymHallId: string | null = null;
  errorMessage = '';

  activityTypes = [
    'musculation',
    'crossfit',
    'yoga',
    'pilates',
    'cardio',
    'boxe',
    'arts_martiaux',
    'danse',
    'natation',
    'escalade',
    'autre',
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly gymHallService: GymHallService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.gymHallForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['France', Validators.required],
      }),
      contact: this.fb.group({
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        website: [''],
      }),
      equipment: this.fb.array([]),
      facilities: this.fb.array([]),
      activityTypes: this.fb.array([], Validators.required),
      openingHours: this.fb.group({
        monday: this.fb.group({ open: [''], close: [''] }),
        tuesday: this.fb.group({ open: [''], close: [''] }),
        wednesday: this.fb.group({ open: [''], close: [''] }),
        thursday: this.fb.group({ open: [''], close: [''] }),
        friday: this.fb.group({ open: [''], close: [''] }),
        saturday: this.fb.group({ open: [''], close: [''] }),
        sunday: this.fb.group({ open: [''], close: [''] }),
      }),
      pricing: this.fb.group({
        monthly: [0],
        quarterly: [0],
        yearly: [0],
        dayPass: [0],
      }),
      capacity: [0],
      images: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.gymHallId = this.route.snapshot.paramMap.get('id');
    if (this.gymHallId) {
      this.isEditMode = true;
      this.loadGymHall(this.gymHallId);
    }
  }

  get equipment(): FormArray {
    return this.gymHallForm.get('equipment') as FormArray;
  }

  get facilities(): FormArray {
    return this.gymHallForm.get('facilities') as FormArray;
  }

  get activityTypesArray(): FormArray {
    return this.gymHallForm.get('activityTypes') as FormArray;
  }

  get images(): FormArray {
    return this.gymHallForm.get('images') as FormArray;
  }

  addEquipment(): void {
    this.equipment.push(
      this.fb.group({
        name: ['', Validators.required],
        quantity: [1, Validators.required],
      })
    );
  }

  removeEquipment(index: number): void {
    this.equipment.removeAt(index);
  }

  addFacility(): void {
    this.facilities.push(this.fb.control(''));
  }

  removeFacility(index: number): void {
    this.facilities.removeAt(index);
  }

  addImage(): void {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  onActivityTypeChange(event: Event, activityType: string): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.activityTypesArray.push(this.fb.control(activityType));
    } else {
      const index = this.activityTypesArray.controls.findIndex(
        (control) => control.value === activityType
      );
      if (index >= 0) {
        this.activityTypesArray.removeAt(index);
      }
    }
  }

  isActivityTypeSelected(activityType: string): boolean {
    return this.activityTypesArray.controls.some((control) => control.value === activityType);
  }

  loadGymHall(id: string): void {
    this.gymHallService.getGymHallById(id).subscribe({
      next: (response) => {
        if (response.data) {
          const gymHall = response.data.gymHall;
          this.gymHallForm.patchValue({
            name: gymHall.name,
            description: gymHall.description,
            address: gymHall.address,
            contact: gymHall.contact,
            openingHours: gymHall.openingHours,
            pricing: gymHall.pricing,
            capacity: gymHall.capacity,
          });

          if (gymHall.equipment) {
            for (const eq of gymHall.equipment) {
              this.equipment.push(this.fb.group(eq));
            }
          }

          if (gymHall.facilities) {
            for (const fac of gymHall.facilities) {
              this.facilities.push(this.fb.control(fac));
            }
          }

          if (gymHall.activityTypes) {
            for (const type of gymHall.activityTypes) {
              this.activityTypesArray.push(this.fb.control(type));
            }
          }

          if (gymHall.images) {
            for (const img of gymHall.images) {
              this.images.push(this.fb.control(img));
            }
          }
        }
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erreur lors du chargement de la salle';
      },
    });
  }

  onSubmit(): void {
    if (this.gymHallForm.valid) {
      const gymHallData = this.gymHallForm.value;

      if (this.isEditMode && this.gymHallId) {
        this.gymHallService.updateGymHall(this.gymHallId, gymHallData).subscribe({
          next: () => {
            this.router.navigate(['/gym-halls', this.gymHallId]);
          },
          error: (err) => {
            this.errorMessage = err.error.message || 'Erreur lors de la mise à jour';
          },
        });
      } else {
        this.gymHallService.createGymHall(gymHallData).subscribe({
          next: (response) => {
            if (response.data) {
              this.router.navigate(['/gym-halls', response.data.gymHall._id]);
            }
          },
          error: (err) => {
            this.errorMessage = err.error.message || 'Erreur lors de la création';
          },
        });
      }
    }
  }
}
