import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService } from '../../services/challenge.service';
import { ChallengeInvitation } from '../../models/challenge.model';

@Component({
  selector: 'app-invitations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitations-list.html',
  styleUrl: './invitations-list.css'
})
export class InvitationsList implements OnInit {
  invitations: ChallengeInvitation[] = [];
  loading = false;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.challengeService.getMyInvitations().subscribe({
      next: (res) => {
        if(res.data) this.invitations = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  respond(id: string, status: 'accepted' | 'rejected'): void {
    this.challengeService.respondToInvitation(id, status).subscribe({
      next: () => {
        // On retire l'invitation de la liste une fois traitée
        this.invitations = this.invitations.filter(i => i._id !== id);
        if (status === 'accepted') alert("Défi rejoint avec succès !");
      }
    });
  }
}