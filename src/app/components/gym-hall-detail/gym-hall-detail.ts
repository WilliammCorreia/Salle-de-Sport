import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GymHallService } from '../../services/gym-hall.service';
import { AuthService } from '../../services/auth.service';
import { GymHall } from '../../models/gym-hall.model';

@Component({
  selector: 'app-gym-hall-detail',
  imports: [CommonModule],
  templateUrl: './gym-hall-detail.html',
  styleUrl: './gym-hall-detail.css',
})
export class GymHallDetail implements OnInit {
  gymHall: GymHall | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gymHallService: GymHallService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGymHall(id);
    }
  }

  loadGymHall(id: string): void {
    this.loading = true;
    this.gymHallService.getGymHallById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gymHall = response.data.gymHall;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.gymHall) {
      this.router.navigate(['/gym-halls/edit', this.gymHall._id]);
    }
  }

  delete(): void {
    if (this.gymHall && confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      this.gymHallService.deleteGymHall(this.gymHall._id).subscribe({
        next: () => {
          this.router.navigate(['/gym-halls']);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/gym-halls']);
  }
}
