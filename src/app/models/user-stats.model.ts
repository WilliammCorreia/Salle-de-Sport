export interface UserBadge {
  name: string;
  description: string;
  earnedAt: Date;
}

export interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  totalWorkouts: number;
  badges: UserBadge[];
  score: number;
}
