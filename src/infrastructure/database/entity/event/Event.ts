import { Types } from "mongoose";
import { Alert } from "../../models/events/eventModel.js";

export default class Event {
  private id: Types.ObjectId;
  private name: string;
  private admin: Types.ObjectId[];
  private invitees?: Types.ObjectId[];
  private startTime: Date;
  private endTime?: Date;
  private location?: string;
  private description?: string;
  private alerts?: Alert[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: EventBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.admin = builder.admin;
    this.invitees = builder.invitees;
    this.startTime = builder.startTime;
    this.endTime = builder.endTime;
    this.location = builder.location;
    this.description = builder.description;
    this.alerts = builder.alerts;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): EventBuilder {
    return new EventBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getAdmin(): Types.ObjectId[] {
    return this.admin;
  }

  public getInvitees(): Types.ObjectId[] | undefined {
    return this.invitees;
  }

  public getStartTime(): Date {
    return this.startTime;
  }

  public getEndTime(): Date | undefined {
    return this.endTime;
  }

  public getLocation(): string | undefined {
    return this.location;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getAlerts(): Alert[] | undefined {
    return this.alerts;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public setId(id: Types.ObjectId): void {
    this.id = id;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setAdmin(admin: Types.ObjectId[]): void {
    this.admin = admin;
  }

  public setInvitees(invitees: Types.ObjectId[]): void {
    this.invitees = invitees;
  }

  public setStartTime(startTime: Date): void {
    this.startTime = startTime;
  }

  public setEndTime(endTime: Date): void {
    this.endTime = endTime;
  }

  public setLocation(location: string): void {
    this.location = location;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public setAlerts(alerts: Alert[]): void {
    this.alerts = alerts;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  public addAdmin(adminId: Types.ObjectId): void {
    if (!this.admin.includes(adminId)) {
      this.admin.push(adminId);
    }
  }

  public removeAdmin(adminId: Types.ObjectId): void {
    this.admin = this.admin.filter((id) => !id.equals(adminId));
  }

  public addInvitee(inviteeId: Types.ObjectId): void {
    if (!this.invitees) {
      this.invitees = [];
    }
    if (!this.invitees.includes(inviteeId)) {
      this.invitees.push(inviteeId);
    }
  }

  public removeInvitee(inviteeId: Types.ObjectId): void {
    if (this.invitees) {
      this.invitees = this.invitees.filter((id) => !id.equals(inviteeId));
    }
  }

  public isAdmin(userId: Types.ObjectId): boolean {
    return this.admin.some((id) => id.equals(userId));
  }

  public isInvitee(userId: Types.ObjectId): boolean {
    return this.invitees?.some((id) => id.equals(userId)) || false;
  }

  // Alert management methods
  public addAlert(alertTime: Date, isCompleted: boolean = false): void {
    if (!this.alerts) {
      this.alerts = [];
    }
    this.alerts.push({ alertTime, isCompleted });
  }

  public removeAlert(alertTime: Date): void {
    if (this.alerts) {
      this.alerts = this.alerts.filter(
        (alert) => alert.alertTime.getTime() !== alertTime.getTime()
      );
    }
  }

  public markAlertAsCompleted(alertTime: Date): void {
    if (this.alerts) {
      const alert = this.alerts.find(
        (alert) => alert.alertTime.getTime() === alertTime.getTime()
      );
      if (alert) {
        alert.isCompleted = true;
      }
    }
  }

  public getPendingAlerts(): Alert[] {
    return this.alerts?.filter((alert) => !alert.isCompleted) || [];
  }

  public getCompletedAlerts(): Alert[] {
    return this.alerts?.filter((alert) => alert.isCompleted) || [];
  }

  public hasPendingAlerts(): boolean {
    return this.getPendingAlerts().length > 0;
  }
}

class EventBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  name: string = "";
  admin: Types.ObjectId[] = [];
  invitees?: Types.ObjectId[];
  startTime: Date = new Date();
  endTime?: Date;
  location?: string;
  description?: string;
  alerts?: Alert[];
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setAdmin(admin: Types.ObjectId[]): this {
    this.admin = admin;
    return this;
  }

  public setInvitees(invitees?: Types.ObjectId[]): this {
    this.invitees = invitees;
    return this;
  }

  public setStartTime(startTime: Date): this {
    this.startTime = startTime;
    return this;
  }

  public setEndTime(endTime?: Date): this {
    this.endTime = endTime;
    return this;
  }

  public setLocation(location?: string): this {
    this.location = location;
    return this;
  }

  public setDescription(description?: string): this {
    this.description = description;
    return this;
  }

  public setAlerts(alerts?: Alert[]): this {
    this.alerts = alerts;
    return this;
  }

  public setCreatedAt(createdAt?: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  public setUpdatedAt(updatedAt?: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  public build(): Event {
    return new Event(this);
  }
}
