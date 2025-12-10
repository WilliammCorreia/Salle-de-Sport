import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../services/challenge.service';
import { AuthService } from '../../services/auth.service';
// Ajoute ChallengeExercise à l'import
import { Challenge, ChallengeExercise } from '../../models/challenge.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './challenge-detail.html',
  styleUrl: './challenge-detail.css'
})
export class ChallengeDetail implements OnInit {
  challenge: Challenge | null = null;
  loading = false;
  isParticipant = false;
  joinLoading = false;
  
  // Pour l'invitation
  inviteEmail = '';
  inviteSuccess = '';
  inviteError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private challengeService: ChallengeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadChallenge(id);
  }

  loadChallenge(id: string): void {
    this.loading = true;
    this.challengeService.getById(id).subscribe({
      next: (res) => {
        this.challenge = res.data || null;
        this.checkParticipation(); // <-- On vérifie l'inscription dès le chargement
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Vérifie si l'utilisateur connecté est dans la liste des participants
  checkParticipation(): void {
    const currentUser = this.authService.getCurrentUser();
    if (this.challenge && currentUser && this.challenge.participants) {
      // On suppose que participants est un tableau d'objets (si populate) ou de strings (ID)
      // Cette vérification gère les deux cas
      this.isParticipant = this.challenge.participants.some((p: any) => 
        (p._id || p) === currentUser._id
      );
    }
  }

  joinChallenge(): void {
    if (!this.challenge) return;
    
    this.joinLoading = true;
    this.challengeService.join(this.challenge._id).subscribe({
      next: () => {
        alert('Félicitations ! Vous avez rejoint ce défi.');
        this.isParticipant = true;
        this.joinLoading = false;
        // Optionnel : Recharger le défi pour mettre à jour le compteur de participants
        this.loadChallenge(this.challenge!._id);
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de l\'inscription');
        this.joinLoading = false;
      }
    });
  }

  sendInvitation(): void {
    if (!this.inviteEmail || !this.challenge) return;

    this.challengeService.inviteUser(this.challenge._id, this.inviteEmail).subscribe({
      next: (res) => {
        this.inviteSuccess = res.message || 'Invitation envoyée !';
        this.inviteError = '';
        this.inviteEmail = '';
      },
      error: (err) => {
        this.inviteError = err.error?.message || 'Erreur lors de l\'envoi';
        this.inviteSuccess = '';
      }
    });
  }
  
  getExerciseName(exercise: ChallengeExercise): string {
    // TypeScript Guard : on vérifie si c'est une string ou un objet
    if (typeof exercise.exerciseType === 'string') {
      return 'Exercice non chargé';
    }
    return exercise.exerciseType.name;
  }

  getCreatorName(creator: User | string): string {
    if (typeof creator === 'string') {
      return 'Utilisateur inconnu';
    }
    return creator.firstName + ' ' + (creator.lastName || '');
  }
}