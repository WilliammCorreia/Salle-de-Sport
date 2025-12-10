import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { GymHallsList } from './components/gym-halls-list/gym-halls-list';
import { GymHallDetail } from './components/gym-hall-detail/gym-hall-detail';
import { GymHallForm } from './components/gym-hall-form/gym-hall-form';
import { UsersList } from './components/users-list/users-list';
import { authGuard, adminGuard, gymOwnerGuard } from './guards/auth.guard';
import { ExerciseTypesList } from './components/exercise-types-list/exercise-types-list';
import { ExerciseTypeForm } from './components/exercise-type-form/exercise-type-form';
import { ChallengesList } from './components/challenges-list/challenges-list';
import { ChallengeForm } from './components/challenge-form/challenge-form';
import { ChallengeDetail } from './components/challenge-detail/challenge-detail';
import { InvitationsList } from './components/invitations-list/invitations-list';

export const routes: Routes = [
  { path: '', redirectTo: '/gym-halls', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'gym-halls', component: GymHallsList },
  { path: 'gym-halls/new', component: GymHallForm, canActivate: [gymOwnerGuard] },
  { path: 'gym-halls/edit/:id', component: GymHallForm, canActivate: [gymOwnerGuard] },
  { path: 'gym-halls/:id', component: GymHallDetail },
  { path: 'users', component: UsersList, canActivate: [adminGuard] },
  // Types d'exercices (Admin)
  { path: 'exercise-types', component: ExerciseTypesList, canActivate: [authGuard] }, // Idéalement adminGuard
  { path: 'exercise-types/new', component: ExerciseTypeForm, canActivate: [authGuard] },
  { path: 'exercise-types/edit/:id', component: ExerciseTypeForm, canActivate: [authGuard] },

  // Défis
  { path: 'challenges', component: ChallengesList, canActivate: [authGuard] },
  { path: 'challenges/new', component: ChallengeForm, canActivate: [authGuard] },
  { path: 'challenges/edit/:id', component: ChallengeForm, canActivate: [authGuard] },
  { path: 'challenges/:id', component: ChallengeDetail, canActivate: [authGuard] },

  // Invitations
  { path: 'invitations', component: InvitationsList, canActivate: [authGuard] },

  { path: '**', redirectTo: '/gym-halls' },
];
