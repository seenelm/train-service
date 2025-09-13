# Nutrition Program Database Schemas

This directory contains all the database schemas needed to implement the comprehensive nutrition program system as outlined in `nutrition-program.md`.

## 📁 Schema Files

### 1. **NutritionProgram** (`nutritionProgramModel.ts`)

**Purpose**: Main program container with phase support

- **Features**: Dynamic phases (bulking, cutting, maintenance), versioning, ownership tracking
- **Key Fields**: `phases[]`, `totalDurationWeeks`, `hasPhases`, `version`, `versionHistory`
- **Use Case**: Coaches create programs for clients, users create personal programs

### 2. **Ingredient** (`ingredientModel.ts`)

**Purpose**: Nutritional database for calorie calculation

- **Features**: Complete nutritional profiles, macro/micro nutrients, verification system
- **Key Fields**: `caloriesPer100g`, `proteinPer100g`, `carbsPer100g`, `fatsPer100g`, `vitamins`, `minerals`
- **Use Case**: Power the calorie calculator and meal planning

### 3. **MealTemplate** (`mealTemplateModel.ts`)

**Purpose**: Reusable meal recipes with nutritional calculations

- **Features**: Ingredient-based recipes, automatic nutritional calculation, versioning
- **Key Fields**: `ingredients[]`, `totalCalories`, `caloriesPerServing`, `instructions`
- **Use Case**: Create meal plans, share recipes, track nutritional content

### 4. **MealLog** (`mealLogModel.ts`)

**Purpose**: Track actual food consumption vs. planned meals

- **Features**: Actual vs. planned comparison, variance tracking, user feedback
- **Key Fields**: `actualCalories`, `plannedCalories`, `calorieVariance`, `templateSnapshot`
- **Use Case**: Daily meal logging, progress tracking, coach monitoring

### 5. **ProgressTracking** (`progressTrackingModel.ts`)

**Purpose**: Comprehensive progress metrics and photo tracking

- **Features**: Weight tracking, progress photos, weekly notes, coach feedback
- **Key Fields**: `weeklyProgress[]`, `startPhotos`, `endPhotos`, `totalWeightChange`
- **Use Case**: Program progress monitoring, before/after photos, coach reviews

### 6. **CalorieCalculator** (`calorieCalculator.ts`)

**Purpose**: Advanced calorie and macro calculation utility

- **Features**: BMR/TDEE calculation, phase-specific targets, meal validation
- **Key Methods**: `calculateNutritionTargets()`, `validateMealPlanCalories()`
- **Use Case**: Automatic calorie targets, meal plan validation, macro distribution

## 🔄 Data Flow

```
1. Coach creates NutritionProgram with phases
2. System calculates calorie targets using CalorieCalculator
3. Coach creates MealTemplates with ingredients
4. System validates meal plans against calorie targets
5. User logs actual consumption in MealLog
6. System tracks progress in ProgressTracking
7. Coach reviews progress and adjusts program
```

## 🎯 Key Features Implemented

### ✅ **Dynamic Program Phases**

- Bulking, cutting, maintenance phases
- Configurable duration and targets
- Phase-specific calorie/macro targets

### ✅ **Advanced Calorie Calculator**

- Mifflin-St Jeor BMR calculation
- Activity level adjustments
- Phase-specific calorie targets
- Macro distribution optimization

### ✅ **Comprehensive Ingredient Database**

- Complete nutritional profiles
- Macro and micro nutrients
- Verification and source tracking
- Barcode support

### ✅ **Smart Meal Planning**

- Ingredient-based recipes
- Automatic nutritional calculation
- Serving size flexibility
- Dietary restriction support

### ✅ **Real-time Progress Tracking**

- Actual vs. planned consumption
- Variance analysis
- Weekly progress photos
- Coach feedback system

### ✅ **Version Control**

- Template versioning
- Change tracking
- Rollback capability
- Audit trail

## 🚀 Usage Examples

### Create a Nutrition Program

```typescript
const program = new NutritionProgramModel({
  name: "12-Week Transformation",
  totalDurationWeeks: 12,
  hasPhases: true,
  phases: [
    {
      phaseNumber: 1,
      name: "Bulking Phase",
      phaseType: "bulking",
      durationWeeks: 8,
      targetWeightChange: 0.5,
      targetWeightChangeType: "gain",
    },
    {
      phaseNumber: 2,
      name: "Cutting Phase",
      phaseType: "cutting",
      durationWeeks: 4,
      targetWeightChange: 1,
      targetWeightChangeType: "lose",
    },
  ],
});
```

### Calculate Calorie Targets

```typescript
const profile = {
  age: 25,
  gender: "male",
  height: 180, // cm
  weight: 75, // kg
  activityLevel: "moderately_active",
  workoutFrequency: 4,
};

const phase = {
  phaseType: "bulking",
  targetWeightChange: 0.5,
  targetWeightChangeType: "gain",
};

const targets = CalorieCalculator.calculateNutritionTargets(profile, phase);
// Returns: { targetCalories: 2800, targetProtein: 175, targetCarbs: 350, targetFats: 78 }
```

### Log a Meal

```typescript
const mealLog = new MealLogModel({
  userId: user._id,
  nutritionProgramId: program._id,
  mealTemplateId: template._id,
  mealName: "Chicken and Rice",
  mealType: "lunch",
  servingsConsumed: 1.5,
  actualCalories: 450,
  plannedCalories: 400,
  calorieVariance: 50,
  rating: 4,
  notes: "Added extra vegetables",
});
```

## 🔧 Technical Considerations

### **Performance Optimizations**

- Strategic database indexes
- Cached nutritional calculations
- Efficient query patterns
- Text search capabilities

### **Data Validation**

- Comprehensive input validation
- Nutritional data consistency checks
- Phase overlap prevention
- Calorie target validation

### **Scalability**

- Modular schema design
- Efficient relationship modeling
- Optimized aggregation pipelines
- Caching strategies

### **Security**

- User data isolation
- Coach access controls
- Data privacy compliance
- Audit trail maintenance

## 📊 Analytics Capabilities

### **User Analytics**

- Daily calorie consumption trends
- Macro distribution analysis
- Progress photo timeline
- Weight progression charts

### **Coach Analytics**

- Client progress monitoring
- Program effectiveness metrics
- Meal plan compliance rates
- Success rate tracking

### **System Analytics**

- Popular ingredient tracking
- Recipe usage statistics
- Program completion rates
- User engagement metrics

This comprehensive nutrition system provides everything needed to build a professional-grade nutrition tracking and coaching platform! 🎉
