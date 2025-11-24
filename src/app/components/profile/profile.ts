import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.userService.updateUser(this.user._id, this.profileForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'Profil mis à jour avec succès';
          this.errorMessage = '';
          if (response.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.user = response.data.user;
          }
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Erreur lors de la mise à jour du profil';
          this.successMessage = '';
        }
      });
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.authService.updatePassword(
        this.passwordForm.value.currentPassword,
        this.passwordForm.value.newPassword
      ).subscribe({
        next: () => {
          this.successMessage = 'Mot de passe mis à jour avec succès';
          this.errorMessage = '';
          this.passwordForm.reset();
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Erreur lors de la mise à jour du mot de passe';
          this.successMessage = '';
        }
      });
    }
  }
}
