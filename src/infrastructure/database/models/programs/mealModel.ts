import { Schema, model, Document, Types } from "mongoose";

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

// Define allowed measurement units
export enum Unit {
  Gram = "g",
  Kilogram = "kg",
  Ounce = "oz",
  Pound = "lb",
  Milliliter = "ml",
  Liter = "l",
  Cup = "cup",
  Tablespoon = "tbsp",
  Teaspoon = "tsp",
  Piece = "piece",
}

// Portion type = number + unit
export interface Portion {
  amount: number;
  unit: Unit;
}

export interface Ingredient {
  name: string;
  portion: Portion;
}

const PortionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    unit: { type: String, enum: Object.values(Unit), required: true },
  },
  { _id: false }
);

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    portion: { type: PortionSchema, required: true },
  },
  { _id: false }
);

export interface MealDocument extends Document {
  createdBy: Types.ObjectId;
  mealName: string;
  macros?: Macros;
  ingredients?: Ingredient[];
  instructions?: string;
  logs?: LogMeal[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LogMeal {
  userId: Types.ObjectId;
  mealId: Types.ObjectId;
  actualMacros?: Macros;
  actualIngredients?: Ingredient[];
  notes?: string;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MacrosSchema = new Schema(
  {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
  { _id: false }
);

const LogMealSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealId: {
      type: Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    actualMacros: {
      type: MacrosSchema,
      required: false,
    },
    actualIngredients: {
      type: [IngredientSchema],
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const MealSchema: Schema = new Schema(
  {
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    macros: {
      type: MacrosSchema,
      required: false,
    },
    ingredients: {
      type: [IngredientSchema],
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    logs: {
      type: [LogMealSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export const MealModel = model<MealDocument>("Meal", MealSchema);
