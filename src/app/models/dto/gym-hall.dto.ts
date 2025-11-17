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
  quantity?: number;
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

export interface CreateGymHallDto {
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

export interface UpdateGymHallDto {
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
