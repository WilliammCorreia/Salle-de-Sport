import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BadgeService, Badge } from '../../services/badge.service';

@Component({
  selector: 'app-badges-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './badges-list.html'
})
export class BadgesListComponent implements OnInit {
  badges: Badge[] = [];
  loading = false;
  error: string | null = null;

  constructor(private badgeService: BadgeService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.loading = true;
    this.error = null;

    this.badgeService.getBadges().subscribe({
      next: (response) => {
        this.badges = Array.isArray(response.data) ? response.data : [response.data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des badges';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteBadge(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      this.badgeService.deleteBadge(id).subscribe({
        next: () => {
          this.loadBadges();
        },
        error: (err) => {
          alert('Erreur lors de la suppression du badge');
          console.error(err);
        }
      });
    }
  }
}
