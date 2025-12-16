import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeService, Badge } from '../../services/badge.service';

@Component({
  selector: 'app-badge-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badge-form.html'
})
export class BadgeFormComponent implements OnInit {
  badge: Partial<Badge> = {
    name: '',
    description: '',
    icon: '🏆',
    category: 'autre',
    rules: {
      type: 'challenges_completed',
      value: 1
    },
    isActive: true,
    rarity: 'commun',
    scoreBonus: 0
  };

  isEditMode = false;
  badgeId: string | null = null;
  loading = false;
  error: string | null = null;

  categories = ['defi', 'entrainement', 'social', 'progression', 'autre'];
  rarities = ['commun', 'rare', 'épique', 'légendaire'];
  ruleTypes = ['challenges_completed', 'workouts_count', 'calories_burned', 'streak_days', 'score_reached', 'custom'];

  constructor(
    private badgeService: BadgeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.badgeId = this.route.snapshot.paramMap.get('id');
    if (this.badgeId) {
      this.isEditMode = true;
      this.loadBadge();
    }
  }

  loadBadge(): void {
    if (!this.badgeId) return;

    this.loading = true;
    this.badgeService.getBadgeById(this.badgeId).subscribe({
      next: (response) => {
        this.badge = Array.isArray(response.data) ? response.data[0] : response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du badge';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = null;

    const operation = this.isEditMode && this.badgeId
      ? this.badgeService.updateBadge(this.badgeId, this.badge)
      : this.badgeService.createBadge(this.badge);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/badges']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la sauvegarde du badge';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/badges']);
  }
}
