import { Schema, model, Document, Types } from "mongoose";

// Ingredient interface
export interface IngredientDocument extends Document {
  name: string;
  brand?: string;
  category:
    | "protein"
    | "carbohydrate"
    | "fat"
    | "vegetable"
    | "fruit"
    | "dairy"
    | "grain"
    | "nut"
    | "seed"
    | "beverage"
    | "condiment"
    | "other";

  // Nutritional information per 100g
  caloriesPer100g: number;
  proteinPer100g: number; // grams
  carbsPer100g: number; // grams
  fatsPer100g: number; // grams
  fiberPer100g?: number; // grams
  sugarPer100g?: number; // grams
  sodiumPer100g?: number; // milligrams

  // Micro nutrients (per 100g)
  vitamins?: {
    vitaminA?: number; // mcg
    vitaminC?: number; // mg
    vitaminD?: number; // mcg
    vitaminE?: number; // mg
    vitaminK?: number; // mcg
    thiamine?: number; // mg
    riboflavin?: number; // mg
    niacin?: number; // mg
    vitaminB6?: number; // mg
    folate?: number; // mcg
    vitaminB12?: number; // mcg
  };

  minerals?: {
    calcium?: number; // mg
    iron?: number; // mg
    magnesium?: number; // mg
    phosphorus?: number; // mg
    potassium?: number; // mg
    zinc?: number; // mg
  };

  // Additional properties
  isVerified: boolean; // Whether nutritional data has been verified
  source?: string; // USDA, Brand, User, etc.
  barcode?: string; // UPC/EAN barcode
  servingSize?: string; // "1 cup", "1 slice", etc.
  servingSizeGrams?: number; // Weight of standard serving

  // User management
  createdBy?: Types.ObjectId; // User who added this ingredient
  isPublic: boolean; // Whether other users can use this ingredient

  // Metadata
  tags?: string[];
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const IngredientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    brand: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: [
        "protein",
        "carbohydrate",
        "fat",
        "vegetable",
        "fruit",
        "dairy",
        "grain",
        "nut",
        "seed",
        "beverage",
        "condiment",
        "other",
      ],
      required: true,
    },

    // Nutritional information per 100g
    caloriesPer100g: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    proteinPer100g: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    carbsPer100g: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fatsPer100g: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fiberPer100g: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    sugarPer100g: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    sodiumPer100g: {
      type: Number,
      required: false,
      min: 0,
      max: 10000,
    },

    // Vitamins (per 100g)
    vitamins: {
      vitaminA: { type: Number, min: 0 },
      vitaminC: { type: Number, min: 0 },
      vitaminD: { type: Number, min: 0 },
      vitaminE: { type: Number, min: 0 },
      vitaminK: { type: Number, min: 0 },
      thiamine: { type: Number, min: 0 },
      riboflavin: { type: Number, min: 0 },
      niacin: { type: Number, min: 0 },
      vitaminB6: { type: Number, min: 0 },
      folate: { type: Number, min: 0 },
      vitaminB12: { type: Number, min: 0 },
    },

    // Minerals (per 100g)
    minerals: {
      calcium: { type: Number, min: 0 },
      iron: { type: Number, min: 0 },
      magnesium: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 },
      potassium: { type: Number, min: 0 },
      zinc: { type: Number, min: 0 },
    },

    // Additional properties
    isVerified: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    barcode: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20,
    },
    servingSize: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    servingSizeGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 10000,
    },

    // User management
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
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
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
IngredientSchema.index({ name: 1, brand: 1 });
IngredientSchema.index({ category: 1 });
IngredientSchema.index({ barcode: 1 });
IngredientSchema.index({ createdBy: 1 });
IngredientSchema.index({ isPublic: 1 });
IngredientSchema.index({ tags: 1 });
IngredientSchema.index({ isVerified: 1 });

// Text search index for ingredient search
IngredientSchema.index({
  name: "text",
  brand: "text",
  category: "text",
});

// Validation middleware
IngredientSchema.pre("validate", function (next) {
  // Validate that macro nutrients don't exceed 100g per 100g
  const totalMacros =
    this.proteinPer100g + this.carbsPer100g + this.fatsPer100g;
  if (totalMacros > 100) {
    return next(new Error("Total macro nutrients cannot exceed 100g per 100g"));
  }

  // Validate that calories make sense (roughly 4 cal/g for protein/carbs, 9 cal/g for fats)
  const expectedCalories =
    this.proteinPer100g * 4 + this.carbsPer100g * 4 + this.fatsPer100g * 9;
  const calorieDifference = Math.abs(this.caloriesPer100g - expectedCalories);

  // Allow 10% variance for fiber and other factors
  if (calorieDifference > expectedCalories * 0.1) {
    return next(
      new Error("Calorie count seems inconsistent with macro nutrients")
    );
  }

  next();
});

export const IngredientModel = model<IngredientDocument>(
  "Ingredient",
  IngredientSchema
);
