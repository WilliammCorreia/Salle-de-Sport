import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html'
})
export class LeaderboardComponent implements OnInit {
  activeTab: 'users' | 'gyms' | 'challenges' | 'badges' = 'users';

  usersLeaderboard: LeaderboardEntry[] = [];
  gymsLeaderboard: LeaderboardEntry[] = [];
  challengesLeaderboard: LeaderboardEntry[] = [];
  badgesLeaderboard: LeaderboardEntry[] = [];

  loading = false;
  error: string | null = null;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadUsersLeaderboard();
  }

  setActiveTab(tab: 'users' | 'gyms' | 'challenges' | 'badges'): void {
    this.activeTab = tab;

    switch(tab) {
      case 'users':
        if (this.usersLeaderboard.length === 0) this.loadUsersLeaderboard();
        break;
      case 'gyms':
        if (this.gymsLeaderboard.length === 0) this.loadGymsLeaderboard();
        break;
      case 'challenges':
        if (this.challengesLeaderboard.length === 0) this.loadChallengesLeaderboard();
        break;
      case 'badges':
        if (this.badgesLeaderboard.length === 0) this.loadBadgesLeaderboard();
        break;
    }
  }

  loadUsersLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getUsersLeaderboard({ limit: 50 }).subscribe({
      next: (response) => {
        this.usersLeaderboard = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du classement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadGymsLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getGymsLeaderboard(50).subscribe({
      next: (response) => {
        this.gymsLeaderboard = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du classement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadChallengesLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getUsersByChallengesCompleted(50).subscribe({
      next: (response) => {
        this.challengesLeaderboard = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du classement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadBadgesLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getUsersByBadges(50).subscribe({
      next: (response) => {
        this.badgesLeaderboard = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du classement';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
