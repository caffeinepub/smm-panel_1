import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceCategory {
    id: bigint;
    name: string;
    description: string;
}
export interface ServiceOrder {
    id: bigint;
    status: OrderStatus;
    cost: number;
    link: string;
    user: Principal;
    quantity: bigint;
    serviceId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface SmmService {
    id: bigint;
    categoryId: bigint;
    maxQuantity: bigint;
    name: string;
    description: string;
    pricePerUnit: number;
    minQuantity: bigint;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAccount(): Promise<void>;
    deposit(amount: number): Promise<void>;
    getBalance(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<ServiceCategory>>;
    getMyOrders(): Promise<Array<ServiceOrder>>;
    getServicesByCategory(categoryId: bigint): Promise<Array<SmmService>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(serviceId: bigint, link: string, quantity: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
