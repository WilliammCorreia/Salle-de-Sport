export interface ExerciseType {
  _id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExerciseType {
  name: string;
  description: string;
  muscleGroups: string[];
}