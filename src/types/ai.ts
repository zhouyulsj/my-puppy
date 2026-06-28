// AI 返回数据类型定义

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskAlert {
  level: RiskLevel;
  title: string;
  description: string;
  action: string;
}

export interface DailyCare {
  diet: string[];
  exercise: string[];
  environment: string[];
  mental_health: string[];
}

export interface HealthData {
  risk_alerts: RiskAlert[];
  daily_care: DailyCare;
  age_notes: string[];
}

export type Importance = 'essential' | 'recommended' | 'optional';

export interface ShoppingItem {
  name: string;
  selection_guide: string;
  ingredient_tips: string;
  price_range: string;
  importance: Importance;
}

export interface ShoppingCategory {
  name: string;
  icon: string;
  items: ShoppingItem[];
}

export interface ShoppingData {
  categories: ShoppingCategory[];
}

export interface UsageGuideData {
  item_name: string;
  usage_method: string;
  dosage: string;
  precautions: string[];
  common_mistakes: string[];
}

export type CalendarCategory =
  | 'vaccine' | 'deworming' | 'grooming' | 'checkup' | 'neutering' | 'special';

export type CalendarImportance = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  month_offset: number;
  category: CalendarCategory;
  action: string;
  importance: CalendarImportance;
  detail: string;
}

export interface CalendarData {
  events: CalendarEvent[];
}

// AI 配置
export interface AiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}
