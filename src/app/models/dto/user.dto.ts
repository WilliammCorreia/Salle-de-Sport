export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'gym_owner' | 'super_admin';
  phone?: string;
  address?: Address;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  profileImage?: string;
}
