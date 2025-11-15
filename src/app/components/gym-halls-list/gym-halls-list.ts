import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymHallService } from '../../services/gym-hall.service';
import { AuthService } from '../../services/auth.service';
import { GymHall } from '../../models/gym-hall.model';

@Component({
  selector: 'app-gym-halls-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './gym-halls-list.html',
  styleUrl: './gym-halls-list.css',
})
export class GymHallsList implements OnInit {
  gymHalls: GymHall[] = [];
  loading = false;
  searchTerm = '';
  cityFilter = '';
  
  constructor(
    private gymHallService: GymHallService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGymHalls();
  }

  loadGymHalls(): void {
    this.loading = true;
    const filters: any = {};
    
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.cityFilter) filters.city = this.cityFilter;

    this.gymHallService.getAllGymHalls(1, 50, filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gymHalls = response.data.gymHalls;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewDetail(id: string): void {
    this.router.navigate(['/gym-halls', id]);
  }

  createNew(): void {
    this.router.navigate(['/gym-halls/new']);
  }

  approveHall(id: string): void {
    this.gymHallService.approveGymHall(id).subscribe({
      next: () => {
        this.loadGymHalls();
      }
    });
  }

  rejectHall(id: string): void {
    this.gymHallService.rejectGymHall(id).subscribe({
      next: () => {
        this.loadGymHalls();
      }
    });
  }
}
