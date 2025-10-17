import { Types } from "mongoose";

export class CursorUtils {
  // Encode cursor (userId + timestamp for sorting)
  static encodeCursor(userId: Types.ObjectId, timestamp: Date): string {
    const cursorData = {
      userId: userId.toString(),
      timestamp: timestamp.toISOString(),
    };
    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  }

  // Decode cursor
  static decodeCursor(cursor: string): { userId: string; timestamp: string } {
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error("Invalid cursor format");
    }
  }

  // Create cursor from user data
  static createCursor(userId: Types.ObjectId, createdAt: Date): string {
    return this.encodeCursor(userId, createdAt);
  }
}
