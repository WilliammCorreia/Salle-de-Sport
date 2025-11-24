import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  errorMessage = '';
  successMessage = '';

  roleFilter = new FormControl('');
  searchTerm = new FormControl('');

  roles = ['client', 'gym_owner', 'super_admin'];

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();

    this.roleFilter.valueChanges.subscribe(() => {
      this.filterUsers();
    });

    this.searchTerm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.data) {
          this.users = response.data.users;
          this.filteredUsers = this.users;
        }
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erreur lors du chargement des utilisateurs';
      },
    });
  }

  filterUsers(): void {
    let filtered = this.users;

    const role = this.roleFilter.value;
    if (role) {
      filtered = filtered.filter((user) => user.role === role);
    }

    const search = this.searchTerm.value?.toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(search) ||
          user.firstName?.toLowerCase().includes(search) ||
          user.lastName?.toLowerCase().includes(search)
      );
    }

    this.filteredUsers = filtered;
  }

  toggleUserStatus(userId: string, currentStatus: boolean): void {
    const action$ = currentStatus
      ? this.userService.deactivateUser(userId)
      : this.userService.activateUser(userId);

    action$.subscribe({
      next: () => {
        this.successMessage = `Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`;
        this.errorMessage = '';
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message || 'Erreur lors de la modification du statut';
        this.successMessage = '';
      },
    });
  }

  changeUserRole(userId: string, newRole: string): void {
    this.userService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.successMessage = 'Rôle mis à jour avec succès';
        this.errorMessage = '';
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message || 'Erreur lors de la mise à jour du rôle';
        this.successMessage = '';
      },
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.errorMessage = '';
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message || 'Erreur lors de la suppression';
          this.successMessage = '';
        },
      });
    }
  }
}
