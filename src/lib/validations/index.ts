import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Dorm)"),
  street: z.string().min(3, "Street address is required"),
  apt: z.string().optional(),
  city: z.string().min(1, "City is required").default("Gainesville"),
  state: z.string().length(2, "State must be 2 characters").default("FL"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const scheduleSchema = z.object({
  addressId: z.string().uuid("Please select an address"),
  pickupSlotId: z.string().uuid("Please select a pickup time"),
  specialInstructions: z.string().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  smsOptIn: z.boolean(),
});

export const weightSchema = z.object({
  weightLbs: z
    .number()
    .min(0.1, "Weight must be greater than 0")
    .max(200, "Weight cannot exceed 200 lbs"),
});
