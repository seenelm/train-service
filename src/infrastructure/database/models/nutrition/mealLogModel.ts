import { Schema, model, Document, Types } from "mongoose";

// Actual ingredient consumed
export interface ConsumedIngredient {
  ingredientId: Types.ObjectId;
  ingredientName?: string; // Cached for performance
  amount: number; // Actual amount consumed in grams
  unit:
    | "grams"
    | "cups"
    | "tablespoons"
    | "teaspoons"
    | "pieces"
    | "slices"
    | "ml"
    | "oz";
  notes?: string; // "extra", "half portion", etc.
  order?: number;
}

// Meal log interface
export interface MealLogDocument extends Document {
  userId: Types.ObjectId;
  nutritionProgramId?: Types.ObjectId; // Optional if standalone meal
  mealTemplateId?: Types.ObjectId; // Optional if custom meal
  phaseId?: Types.ObjectId; // If part of a program phase

  // Meal information
  mealName: string;
  mealType:
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snack"
    | "pre_workout"
    | "post_workout"
    | "other";
  consumedAt: Date; // When the meal was consumed

  // Actual consumption
  ingredients: ConsumedIngredient[];
  servingsConsumed: number; // How many servings of the template were consumed

  // Actual nutritional values (what was actually consumed)
  actualCalories?: number;
  actualProtein?: number; // grams
  actualCarbs?: number; // grams
  actualFats?: number; // grams
  actualFiber?: number; // grams
  actualSugar?: number; // grams
  actualSodium?: number; // milligrams

  // Comparison with planned values
  plannedCalories?: number; // What was planned
  plannedProtein?: number;
  plannedCarbs?: number;
  plannedFats?: number;

  // Variance tracking
  calorieVariance?: number; // actual - planned
  proteinVariance?: number;
  carbsVariance?: number;
  fatsVariance?: number;

  // User feedback
  rating?: number; // 1-5 star rating
  notes?: string; // User notes about the meal
  wasCompleted: boolean; // Whether the meal was fully consumed

  // Template versioning (similar to workout logs)
  templateVersion?: string;
  templateSnapshot?: any; // Complete template data when meal was logged

  // Metadata
  location?: string; // Where the meal was consumed
  mood?: "great" | "good" | "okay" | "bad" | "terrible"; // How user felt after meal
  hungerLevel?: number; // 1-10 scale before meal
  fullnessLevel?: number; // 1-10 scale after meal

  createdAt?: Date;
  updatedAt?: Date;
}

// Consumed ingredient schema
const consumedIngredientSchema = new Schema(
  {
    ingredientId: {
      type: Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    ingredientName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    unit: {
      type: String,
      enum: [
        "grams",
        "cups",
        "tablespoons",
        "teaspoons",
        "pieces",
        "slices",
        "ml",
        "oz",
      ],
      required: true,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

// Main MealLog schema
const MealLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    nutritionProgramId: {
      type: Types.ObjectId,
      ref: "NutritionProgram",
      required: false,
    },
    mealTemplateId: {
      type: Types.ObjectId,
      ref: "MealTemplate",
      required: false,
    },
    phaseId: {
      type: Types.ObjectId,
      required: false,
    },

    // Meal information
    mealName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    mealType: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "pre_workout",
        "post_workout",
        "other",
      ],
      required: true,
    },
    consumedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Actual consumption
    ingredients: {
      type: [consumedIngredientSchema],
      default: [],
    },
    servingsConsumed: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 1,
    },

    // Actual nutritional values
    actualCalories: {
      type: Number,
      required: false,
      min: 0,
    },
    actualProtein: {
      type: Number,
      required: false,
      min: 0,
    },
    actualCarbs: {
      type: Number,
      required: false,
      min: 0,
    },
    actualFats: {
      type: Number,
      required: false,
      min: 0,
    },
    actualFiber: {
      type: Number,
      required: false,
      min: 0,
    },
    actualSugar: {
      type: Number,
      required: false,
      min: 0,
    },
    actualSodium: {
      type: Number,
      required: false,
      min: 0,
    },

    // Comparison with planned values
    plannedCalories: {
      type: Number,
      required: false,
      min: 0,
    },
    plannedProtein: {
      type: Number,
      required: false,
      min: 0,
    },
    plannedCarbs: {
      type: Number,
      required: false,
      min: 0,
    },
    plannedFats: {
      type: Number,
      required: false,
      min: 0,
    },

    // Variance tracking
    calorieVariance: {
      type: Number,
      required: false,
    },
    proteinVariance: {
      type: Number,
      required: false,
    },
    carbsVariance: {
      type: Number,
      required: false,
    },
    fatsVariance: {
      type: Number,
      required: false,
    },

    // User feedback
    rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    wasCompleted: {
      type: Boolean,
      default: true,
    },

    // Template versioning
    templateVersion: {
      type: String,
      required: false,
    },
    templateSnapshot: {
      type: Schema.Types.Mixed,
      required: false,
    },

    // Metadata
    location: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "bad", "terrible"],
      required: false,
    },
    hungerLevel: {
      type: Number,
      required: false,
      min: 1,
      max: 10,
    },
    fullnessLevel: {
      type: Number,
      required: false,
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
MealLogSchema.index({ userId: 1, consumedAt: -1 });
MealLogSchema.index({ nutritionProgramId: 1, consumedAt: -1 });
MealLogSchema.index({ mealTemplateId: 1 });
MealLogSchema.index({ phaseId: 1 });
MealLogSchema.index({ mealType: 1 });
MealLogSchema.index({ consumedAt: -1 });
MealLogSchema.index({ rating: -1 });

// Pre-save middleware to calculate nutritional values and variances
MealLogSchema.pre("save", async function (next) {
  if (this.isModified("ingredients") || this.isModified("servingsConsumed")) {
    try {
      // Calculate actual nutritional values from consumed ingredients
      let actualCalories = 0;
      let actualProtein = 0;
      let actualCarbs = 0;
      let actualFats = 0;
      let actualFiber = 0;
      let actualSugar = 0;
      let actualSodium = 0;

      // Note: In a real implementation, you would populate the ingredients
      // and calculate based on the actual ingredient nutritional data
      // For now, we'll set placeholder values

      this.actualCalories = actualCalories;
      this.actualProtein = actualProtein;
      this.actualCarbs = actualCarbs;
      this.actualFats = actualFats;
      this.actualFiber = actualFiber;
      this.actualSugar = actualSugar;
      this.actualSodium = actualSodium;

      // Calculate variances if planned values exist
      if (this.plannedCalories !== undefined && this.plannedCalories !== null) {
        this.calorieVariance = actualCalories - this.plannedCalories;
      }
      if (this.plannedProtein !== undefined && this.plannedProtein !== null) {
        this.proteinVariance = actualProtein - this.plannedProtein;
      }
      if (this.plannedCarbs !== undefined && this.plannedCarbs !== null) {
        this.carbsVariance = actualCarbs - this.plannedCarbs;
      }
      if (this.plannedFats !== undefined && this.plannedFats !== null) {
        this.fatsVariance = actualFats - this.plannedFats;
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export const MealLogModel = model<MealLogDocument>("MealLog", MealLogSchema);
