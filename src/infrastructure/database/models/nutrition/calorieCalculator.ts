import { Types } from "mongoose";

// User profile interface for calorie calculation
export interface UserProfile {
  age: number;
  gender: "male" | "female";
  height: number; // in centimeters
  weight: number; // in kilograms
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  workoutFrequency: number; // times per week
}

// Phase type for calorie adjustment
export interface PhaseTargets {
  phaseType: "bulking" | "cutting" | "maintenance";
  targetWeightChange?: number; // pounds per week
  targetWeightChangeType?: "gain" | "lose" | "maintain";
}

// Calorie calculation result
export interface CalorieCalculationResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number; // Target calories per day
  targetProtein: number; // Target protein in grams
  targetCarbs: number; // Target carbs in grams
  targetFats: number; // Target fats in grams
  weightChangePerWeek: number; // Expected weight change per week
  phaseType: string;
}

export class CalorieCalculator {
  // Activity level multipliers
  private static readonly ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };

  // Calories per gram of macronutrients
  private static readonly CALORIES_PER_GRAM = {
    protein: 4,
    carbs: 4,
    fats: 9,
  };

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  static calculateBMR(profile: UserProfile): number {
    const { age, gender, height, weight } = profile;

    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  static calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultiplier = this.ACTIVITY_MULTIPLIERS[profile.activityLevel];
    return bmr * activityMultiplier;
  }

  /**
   * Calculate target calories based on phase and goals
   */
  static calculateTargetCalories(
    profile: UserProfile,
    phase: PhaseTargets
  ): number {
    const tdee = this.calculateTDEE(profile);
    const { phaseType, targetWeightChange, targetWeightChangeType } = phase;

    // Default weight change per week if not specified
    let weightChangePerWeek = 0;

    if (targetWeightChange !== undefined && targetWeightChangeType) {
      weightChangePerWeek =
        targetWeightChangeType === "lose"
          ? -targetWeightChange
          : targetWeightChange;
    } else {
      // Default values based on phase type
      switch (phaseType) {
        case "bulking":
          weightChangePerWeek = 0.5; // 0.5 pounds per week
          break;
        case "cutting":
          weightChangePerWeek = -1; // 1 pound per week
          break;
        case "maintenance":
          weightChangePerWeek = 0;
          break;
      }
    }

    // Calculate calorie adjustment (3500 calories = 1 pound)
    const weeklyCalorieAdjustment = weightChangePerWeek * 3500;
    const dailyCalorieAdjustment = weeklyCalorieAdjustment / 7;

    return Math.round(tdee + dailyCalorieAdjustment);
  }

  /**
   * Calculate macro targets based on calories and phase
   */
  static calculateMacroTargets(
    calories: number,
    phase: PhaseTargets
  ): {
    protein: number;
    carbs: number;
    fats: number;
  } {
    const { phaseType } = phase;

    let proteinPercentage: number;
    let fatPercentage: number;

    // Macro distribution based on phase
    switch (phaseType) {
      case "bulking":
        proteinPercentage = 0.25; // 25% protein
        fatPercentage = 0.25; // 25% fat
        break;
      case "cutting":
        proteinPercentage = 0.35; // 35% protein (higher for muscle preservation)
        fatPercentage = 0.2; // 20% fat
        break;
      case "maintenance":
        proteinPercentage = 0.3; // 30% protein
        fatPercentage = 0.25; // 25% fat
        break;
      default:
        proteinPercentage = 0.3;
        fatPercentage = 0.25;
    }

    const carbPercentage = 1 - proteinPercentage - fatPercentage;

    // Calculate grams
    const proteinCalories = calories * proteinPercentage;
    const fatCalories = calories * fatPercentage;
    const carbCalories = calories * carbPercentage;

    return {
      protein: Math.round(proteinCalories / this.CALORIES_PER_GRAM.protein),
      carbs: Math.round(carbCalories / this.CALORIES_PER_GRAM.carbs),
      fats: Math.round(fatCalories / this.CALORIES_PER_GRAM.fats),
    };
  }

  /**
   * Complete calorie and macro calculation
   */
  static calculateNutritionTargets(
    profile: UserProfile,
    phase: PhaseTargets
  ): CalorieCalculationResult {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(profile);
    const targetCalories = this.calculateTargetCalories(profile, phase);
    const macros = this.calculateMacroTargets(targetCalories, phase);

    // Calculate expected weight change per week
    const weeklyCalorieDifference = (targetCalories - tdee) * 7;
    const weightChangePerWeek = weeklyCalorieDifference / 3500;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFats: macros.fats,
      weightChangePerWeek: Math.round(weightChangePerWeek * 100) / 100, // Round to 2 decimal places
      phaseType: phase.phaseType,
    };
  }

  /**
   * Validate calorie targets against meal plans
   */
  static validateMealPlanCalories(
    plannedCalories: number,
    targetCalories: number,
    tolerance: number = 50 // 50 calorie tolerance
  ): { isValid: boolean; variance: number; message?: string } {
    const variance = Math.abs(plannedCalories - targetCalories);
    const isValid = variance <= tolerance;

    let message: string | undefined;
    if (!isValid) {
      if (plannedCalories > targetCalories) {
        message = `Meal plan exceeds target by ${variance} calories. Consider reducing portion sizes.`;
      } else {
        message = `Meal plan is ${variance} calories below target. Consider adding snacks or increasing portion sizes.`;
      }
    }

    return {
      isValid,
      variance,
      message,
    };
  }

  /**
   * Calculate nutritional values for a meal from ingredients
   */
  static calculateMealNutrition(
    ingredients: Array<{
      ingredientId: Types.ObjectId;
      amount: number; // in grams
      nutritionalData: {
        caloriesPer100g: number;
        proteinPer100g: number;
        carbsPer100g: number;
        fatsPer100g: number;
        fiberPer100g?: number;
        sugarPer100g?: number;
        sodiumPer100g?: number;
      };
    }>
  ): {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
  } {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    ingredients.forEach((ingredient) => {
      const { amount, nutritionalData } = ingredient;
      const multiplier = amount / 100; // Convert to 100g basis

      totalCalories += nutritionalData.caloriesPer100g * multiplier;
      totalProtein += nutritionalData.proteinPer100g * multiplier;
      totalCarbs += nutritionalData.carbsPer100g * multiplier;
      totalFats += nutritionalData.fatsPer100g * multiplier;
      totalFiber += (nutritionalData.fiberPer100g || 0) * multiplier;
      totalSugar += (nutritionalData.sugarPer100g || 0) * multiplier;
      totalSodium += (nutritionalData.sodiumPer100g || 0) * multiplier;
    });

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 100) / 100,
      totalCarbs: Math.round(totalCarbs * 100) / 100,
      totalFats: Math.round(totalFats * 100) / 100,
      totalFiber: Math.round(totalFiber * 100) / 100,
      totalSugar: Math.round(totalSugar * 100) / 100,
      totalSodium: Math.round(totalSodium),
    };
  }
}
