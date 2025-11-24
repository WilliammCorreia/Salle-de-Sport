export interface GymHall {
  _id: string;
  name: string;
  description: string;
  owner: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  capacity: number;
  equipment?: Equipment[];
  facilities?: string[];
  activityTypes?: ActivityType[];
  difficultyLevels?: DifficultyLevel[];
  openingHours?: OpeningHours;
  pricing?: {
    dailyPass?: number;
    monthlySubscription?: number;
    yearlySubscription?: number;
    currency: string;
  };
  images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rating?: {
    average: number;
    count: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  name: string;
  quantity: number;
  description?: string;
}

export type ActivityType =
  | 'musculation'
  | 'cardio'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'boxing'
  | 'spinning'
  | 'danse'
  | 'natation'
  | 'arts_martiaux'
  | 'fitness'
  | 'autre';

export type DifficultyLevel = 'débutant' | 'intermédiaire' | 'avancé' | 'expert';

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface GymHallAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface GymHallContact {
  phone: string;
  email: string;
  website?: string;
}

export interface Equipment {
  name: string;
  quantity: number;
  description?: string;
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
  } | null;
}

export interface Pricing {
  daily?: number;
  monthly?: number;
  yearly?: number;
  session?: number;
}

export interface CreateGymHall {
  name: string;
  description: string;
  address: GymHallAddress;
  contact: GymHallContact;
  capacity: number;
  equipment?: Equipment[];
  facilities?: string[];
  activityTypes?: string[];
  difficultyLevels?: string[];
  openingHours?: OpeningHours;
  pricing?: Pricing;
  images?: string[];
}

export interface UpdateGymHall {
  name?: string;
  description?: string;
  address?: GymHallAddress;
  contact?: GymHallContact;
  capacity?: number;
  equipment?: Equipment[];
  facilities?: string[];
  activityTypes?: string[];
  difficultyLevels?: string[];
  openingHours?: OpeningHours;
  pricing?: Pricing;
  images?: string[];
}
