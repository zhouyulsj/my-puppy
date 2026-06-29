// 宠物相关类型定义

export type PetSpecies = 'cat' | 'dog';

export type CoatType = '短毛' | '长毛' | '无毛' | '双层毛' | '卷毛';

export type CatSize = '小型' | '中型' | '大型';
export type DogSize = '小型犬' | '中型犬' | '大型犬' | '巨型犬';

export interface BreedInfo {
  display_name: string;
  alias?: string;
  category?: string;
  origin?: string;
  adult_weight: { min: number; max: number };
  body_length?: { min: number; max: number };       // 含尾体长 cm（猫常用）
  shoulder_height?: { min: number; max: number };   // 肩高 cm（狗常用）
  common_risks: string[];
  life_expectancy: string;
  coat_type: CoatType;
  coat_type_detail?: string;   // 原始详细毛型描述（如"短毛(双层)"）
  size: CatSize | DogSize;
  personality?: string;
  nutrition_notes?: string;
  disease_resistance?: string;
  exercise_need?: string;
  suitable_for?: string;
  notes?: string;
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
