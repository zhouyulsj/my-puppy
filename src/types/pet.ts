// 宠物相关类型定义

export type PetSpecies = 'cat' | 'dog';

export type CoatType = '短毛' | '长毛' | '无毛' | '双层毛';

export type CatSize = '小型' | '中型';
export type DogSize = '小型犬' | '中型犬' | '大型犬';

export interface BreedInfo {
  display_name: string;
  adult_weight: { min: number; max: number };
  common_risks: string[];
  life_expectancy: string;
  coat_type: CoatType;
  size: CatSize | DogSize;
}

export interface PetProfile {
  name: string;
  species: PetSpecies;
  breed: string; // breed key
  ageMonths: number;
  weight: number; // kg
  neutered: boolean;
  createdAt: number;
}

// 根据月龄判断饮食阶段
export type DietStage =
  | 'kitten' | 'adult_cat' | 'senior_cat'
  | 'puppy_small' | 'puppy_medium' | 'puppy_large'
  | 'adult_dog_small' | 'adult_dog_medium' | 'adult_dog_large'
  | 'senior_dog';
