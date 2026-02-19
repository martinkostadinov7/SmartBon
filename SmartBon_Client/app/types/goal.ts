import { GoalContribution } from "./goalContribution";

export interface Goal {
  id: number;
  name: string;
  description: string;
  targetDate: Date;
  finalAmount: number;
  currentAmount: number;
  icon: string;
  colorHex: string;
  contributions: GoalContribution[];
}