import { Schema, model, Document, Types } from "mongoose";
import { Unit } from "@seenelm/train-core";

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MacrosSnapshot {
  protein: number;
  carbs: number;
  fats: number;
}

// Portion type = number + unit
export interface Portion {
  amount: number;
  unit: Unit;
}

export interface PortionSnapshot {
  amount: number;
  unit: Unit;
}

export interface Ingredient {
  name: string;
  portion: Portion;
}

export interface IngredientSnapshot {
  name: string;
  portionSnapshot: PortionSnapshot;
}

const PortionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    unit: { type: String, enum: Object.values(Unit), required: true },
  },
  { _id: false }
);

const PortionSnapshotSchema = new Schema(
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

const IngredientSnapshotSchema = new Schema(
  {
    name: { type: String, required: true },
    portion: { type: PortionSnapshotSchema, required: true },
  },
  { _id: false }
);

export interface MealDocument extends Document {
  versionId: number;
  createdBy: Types.ObjectId;
  mealName: string;
  macros?: Macros;
  ingredients?: Ingredient[];
  instructions?: string;
  logs?: MealLog[];
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealSnapshot {
  createdBy: Types.ObjectId;
  mealName: string;
  macrosSnapshot?: MacrosSnapshot;
  ingredientSnapshot?: IngredientSnapshot[];
  instructions?: string;
  startDate: Date;
  endDate: Date;
}

export interface MealLog {
  versionId: number;
  userId: Types.ObjectId;
  mealId: Types.ObjectId;
  mealSnapshot: MealSnapshot;
  actualMacros?: Macros;
  actualIngredients?: Ingredient[];
  notes?: string;
  isCompleted: boolean;
  actualStartDate: Date;
  actualEndDate: Date;
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

const MacrosSnapshotSchema = new Schema(
  {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
  { _id: false }
);

const MealSnapshotSchema = new Schema(
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
    macrosSnapshot: {
      type: MacrosSnapshotSchema,
      required: false,
    },
    ingredientSnapshot: {
      type: [IngredientSnapshotSchema],
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const MealLogSchema = new Schema(
  {
    versionId: {
      type: Number,
      required: true,
    },
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
    mealSnapshot: {
      type: MealSnapshotSchema,
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
    actualStartDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const MealSchema: Schema = new Schema(
  {
    versionId: {
      type: Number,
      required: true,
      default: 1,
    },
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
      type: [MealLogSchema],
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const MealModel = model<MealDocument>("Meal", MealSchema);
