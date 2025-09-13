import { Schema, model, Document, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

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

// Ingredient type = food name -> portion
export type Ingredient = Record<string, Portion>;

export interface MealDocument extends Document {
  createdBy: Types.ObjectId;
  mealName: string;
  macros?: Macros;
  ingredients?: Ingredient[];
  instructions?: string;
  logs: LogMeal[];
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

const LogMealSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealId: {
      type: Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    actualMacros: {
      type: Object,
      required: false,
    },
    actualIngredients: {
      type: Object,
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
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const MealSchema: Schema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    macros: {
      type: Object,
      required: false,
    },
    ingredients: {
      type: Object,
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    logs: {
      type: [LogMealSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const MealModel = model<MealDocument>("Meal", MealSchema);
