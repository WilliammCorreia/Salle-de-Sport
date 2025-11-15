import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { GymHallsList } from './components/gym-halls-list/gym-halls-list';
import { GymHallDetail } from './components/gym-hall-detail/gym-hall-detail';
import { GymHallForm } from './components/gym-hall-form/gym-hall-form';
import { UsersList } from './components/users-list/users-list';
import { authGuard, adminGuard, gymOwnerGuard } from './guards/auth.guard';

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
  { path: '**', redirectTo: '/gym-halls' }
];
