import { User } from './user.model';
import { ExerciseType } from './exercise-type.model';
import { GymHall } from './gym-hall.model';

export type ChallengeCategory = 'perte_poids' | 'prise_masse' | 'endurance' | 'force' | 'souplesse' | 'autre';
export type ChallengeDifficulty = 'débutant' | 'intermédiaire' | 'avancé' | 'expert';

export interface ChallengeExercise {
  exerciseType: ExerciseType | string; // ID ou objet peuplé
  sets: number;
  reps: number;
  restTime: number; // en secondes
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  creator: User | string;
  gymHall?: GymHall | string | null;
  equipment?: string[];
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: number; // en jours (ou unité définie)
  exercises: ChallengeExercise[];
  participants?: User[] | string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pour le formulaire de création
export interface CreateChallenge {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  exercises: {
    exerciseType: string; // ID envoyé au backend
    sets: number;
    reps: number;
    restTime: number;
  }[];
  gymHall?: string;
  equipment?: string[];
}

// Pour les filtres d'exploration
export interface ChallengeFilters {
  difficulty?: string;
  minDuration?: number;
  maxDuration?: number;
  exercicesTypes?: string[]; // IDs
  gymHall?: string;
}

// --- Partie Sociale ---

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface ChallengeInvitation {
  _id: string;
  sender: User;
  recipient: User;
  challenge: Challenge;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}