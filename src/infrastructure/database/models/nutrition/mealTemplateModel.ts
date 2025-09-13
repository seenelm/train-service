import { Schema, model, Document, Types } from "mongoose";

// Ingredient in meal template
export interface MealIngredient {
  ingredientId: Types.ObjectId;
  ingredientName?: string; // Cached for performance
  amount: number; // Amount in grams
  unit:
    | "grams"
    | "cups"
    | "tablespoons"
    | "teaspoons"
    | "pieces"
    | "slices"
    | "ml"
    | "oz";
  notes?: string; // "chopped", "diced", etc.
  order?: number; // For ingredient ordering
}

// Meal template interface
export interface MealTemplateDocument extends Document {
  name: string;
  description?: string;
  mealType:
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snack"
    | "pre_workout"
    | "post_workout"
    | "other";

  // Recipe information
  ingredients: MealIngredient[];
  instructions?: string; // Cooking instructions
  prepTimeMin?: number; // Preparation time in minutes
  cookTimeMin?: number; // Cooking time in minutes
  servings: number; // Number of servings this recipe makes

  // Nutritional information (calculated from ingredients)
  totalCalories?: number;
  totalProtein?: number; // grams
  totalCarbs?: number; // grams
  totalFats?: number; // grams
  totalFiber?: number; // grams
  totalSugar?: number; // grams
  totalSodium?: number; // milligrams

  // Per serving nutritional information
  caloriesPerServing?: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatsPerServing?: number;
  fiberPerServing?: number;
  sugarPerServing?: number;
  sodiumPerServing?: number;

  // Template metadata
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string; // "Italian", "Mexican", "Asian", etc.
  dietaryRestrictions?: string[]; // ["vegetarian", "vegan", "gluten-free", "dairy-free"]

  // Ownership and sharing
  createdBy?: Types.ObjectId;
  isPublic: boolean;
  isVerified: boolean; // Whether nutritional data has been verified

  // Versioning
  version: string;
  versionHistory: {
    version: string;
    changedAt: Date;
    changedBy: Types.ObjectId;
    changes: string[];
    changeReason?: string;
  }[];

  // Usage tracking
  timesUsed?: number; // How many times this template has been used
  averageRating?: number; // Average user rating (1-5)

  // Metadata
  tags?: string[];
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// Ingredient schema
const mealIngredientSchema = new Schema(
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

// Main MealTemplate schema
const MealTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
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

    // Recipe information
    ingredients: {
      type: [mealIngredientSchema],
      default: [],
    },
    instructions: {
      type: String,
      required: false,
      trim: true,
      maxlength: 5000,
    },
    prepTimeMin: {
      type: Number,
      required: false,
      min: 0,
      max: 1440, // Max 24 hours
    },
    cookTimeMin: {
      type: Number,
      required: false,
      min: 0,
      max: 1440, // Max 24 hours
    },
    servings: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1,
    },

    // Nutritional information (calculated)
    totalCalories: {
      type: Number,
      required: false,
      min: 0,
    },
    totalProtein: {
      type: Number,
      required: false,
      min: 0,
    },
    totalCarbs: {
      type: Number,
      required: false,
      min: 0,
    },
    totalFats: {
      type: Number,
      required: false,
      min: 0,
    },
    totalFiber: {
      type: Number,
      required: false,
      min: 0,
    },
    totalSugar: {
      type: Number,
      required: false,
      min: 0,
    },
    totalSodium: {
      type: Number,
      required: false,
      min: 0,
    },

    // Per serving nutritional information
    caloriesPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    proteinPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    carbsPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    fatsPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    fiberPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    sugarPerServing: {
      type: Number,
      required: false,
      min: 0,
    },
    sodiumPerServing: {
      type: Number,
      required: false,
      min: 0,
    },

    // Template metadata
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: false,
    },
    cuisine: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    dietaryRestrictions: {
      type: [String],
      default: [],
    },

    // Ownership and sharing
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Versioning
    version: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    versionHistory: [
      {
        version: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        changedBy: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        changes: [
          {
            type: String,
            required: true,
          },
        ],
        changeReason: {
          type: String,
          required: false,
        },
      },
    ],

    // Usage tracking
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },

    // Metadata
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
MealTemplateSchema.index({ name: 1 });
MealTemplateSchema.index({ mealType: 1 });
MealTemplateSchema.index({ createdBy: 1 });
MealTemplateSchema.index({ isPublic: 1 });
MealTemplateSchema.index({ difficulty: 1 });
MealTemplateSchema.index({ cuisine: 1 });
MealTemplateSchema.index({ dietaryRestrictions: 1 });
MealTemplateSchema.index({ tags: 1 });
MealTemplateSchema.index({ averageRating: -1 });
MealTemplateSchema.index({ timesUsed: -1 });

// Text search index
MealTemplateSchema.index({
  name: "text",
  description: "text",
  instructions: "text",
});

// Pre-save middleware to calculate nutritional information
MealTemplateSchema.pre("save", async function (next) {
  if (this.isModified("ingredients") || this.isModified("servings")) {
    try {
      // Calculate total nutritional values from ingredients
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;
      let totalFiber = 0;
      let totalSugar = 0;
      let totalSodium = 0;

      // Note: In a real implementation, you would populate the ingredients
      // and calculate based on the actual ingredient nutritional data
      // For now, we'll set placeholder values

      this.totalCalories = totalCalories;
      this.totalProtein = totalProtein;
      this.totalCarbs = totalCarbs;
      this.totalFats = totalFats;
      this.totalFiber = totalFiber;
      this.totalSugar = totalSugar;
      this.totalSodium = totalSodium;

      // Calculate per serving values
      if (this.servings > 0) {
        this.caloriesPerServing = totalCalories / this.servings;
        this.proteinPerServing = totalProtein / this.servings;
        this.carbsPerServing = totalCarbs / this.servings;
        this.fatsPerServing = totalFats / this.servings;
        this.fiberPerServing = totalFiber / this.servings;
        this.sugarPerServing = totalSugar / this.servings;
        this.sodiumPerServing = totalSodium / this.servings;
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export const MealTemplateModel = model<MealTemplateDocument>(
  "MealTemplate",
  MealTemplateSchema
);
