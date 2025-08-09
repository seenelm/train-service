import { Types } from "mongoose";

/**
 * Request DTO for group programs
 */
export interface GroupProgramsRequest {
    groupId: string;
    programs: string[];
}

/**
 * Detailed response DTO for group programs
 */
export interface DetailedGroupProgramsResponse {
    _id: Types.ObjectId;
    name: string;
    description: string;
    category: string;
    numWeeks: number;
    imagePath: string;
    createdBy: Types.ObjectId;
    difficulty: number;
    createdAt: Date;
    updatedAt: Date;
    weeks?: {
        _id: Types.ObjectId;
        programId: Types.ObjectId;
        name: string;
        description: string;
        imagePath: string;
        weekNumber: number;
        createdAt: Date;
        updatedAt: Date;
        workouts?: {
            _id: Types.ObjectId;
            title: string;
            description: string;
            imagePath: string;
            completed: boolean;
            exercises?: {
                _id: Types.ObjectId;
                name: string;
                description: string;
                muscleGroup: string;
                imagePath: string;
                sets?: {
                    _id: Types.ObjectId;
                    reps: number;
                    weight: number;
                    rest: number;
                    completed: boolean;
                }[];
            }[];
        }[];
    }[];
}
