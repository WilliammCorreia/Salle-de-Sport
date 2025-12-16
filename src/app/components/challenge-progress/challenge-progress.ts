import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgressService, ChallengeProgress } from '../../services/progress.service';

@Component({
  selector: 'app-challenge-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './challenge-progress.html'
})
export class ChallengeProgressComponent implements OnInit {
  challengeId: string | null = null;
  progress: ChallengeProgress | null = null;
  loading = false;
  error: string | null = null;
  newProgressValue = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('id');
    if (this.challengeId) {
      this.loadProgress();
    }
  }

  loadProgress(): void {
    if (!this.challengeId) return;

    this.loading = true;
    this.progressService.getChallengeProgress(this.challengeId).subscribe({
      next: (response) => {
        this.progress = Array.isArray(response.data) ? response.data[0] : response.data;
        this.newProgressValue = this.progress.progression;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la progression';
        this.loading = false;
        console.error(err);
      }
    });
  }

  startChallenge(): void {
    if (!this.challengeId) return;

    this.loading = true;
    this.progressService.startChallenge(this.challengeId).subscribe({
      next: () => {
        this.loadProgress();
      },
      error: (err) => {
        alert('Erreur lors du démarrage du défi');
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateProgress(): void {
    if (!this.challengeId) return;

    this.loading = true;
    this.progressService.updateChallengeProgress(this.challengeId, {
      progression: this.newProgressValue
    }).subscribe({
      next: () => {
        this.loadProgress();
        alert('Progression mise à jour');
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour');
        this.loading = false;
        console.error(err);
      }
    });
  }

  completeChallenge(): void {
    if (!this.challengeId) return;
    if (!confirm('Êtes-vous sûr de vouloir marquer ce défi comme terminé ?')) return;

    this.loading = true;
    this.progressService.completeChallenge(this.challengeId).subscribe({
      next: () => {
        this.loadProgress();
        alert('Félicitations ! Défi complété !');
      },
      error: (err) => {
        alert('Erreur lors de la complétion du défi');
        this.loading = false;
        console.error(err);
      }
    });
  }

  abandonChallenge(): void {
    if (!this.challengeId) return;
    if (!confirm('Êtes-vous sûr de vouloir abandonner ce défi ?')) return;

    this.loading = true;
    this.progressService.abandonChallenge(this.challengeId).subscribe({
      next: () => {
        this.loadProgress();
        alert('Défi abandonné');
      },
      error: (err) => {
        alert('Erreur lors de l\'abandon du défi');
        this.loading = false;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/challenges']);
  }
}
