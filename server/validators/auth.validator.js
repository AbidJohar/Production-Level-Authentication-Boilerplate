 import { z } from 'zod';

// Define the shape of your data
export const authSchemas = {
  register: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(30, "Name cannot exceed 30 characters")
      .trim(),
    
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .lowercase()
      .trim(),
    
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .trim(),
  }),

  login: z.object({
    email: z.string().email("Invalid email format").lowercase().trim(),
    password: z.string().min(1, "Password is required"),
  }),
};

// This helper function handles the validation logic
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // DEFENSIVE LOGIC: Check if error.issues or error.errors exists
    const issues = result.error?.issues || result.error?.errors || [];

    const errorMessages = issues.length > 0 
      ? issues.map((err) => ({
          field: err.path ? err.path[0] : "unknown",
          message: err.message,
        }))
      : [{ field: "form", message: "Invalid input data" }];

      console.log(" error message:",errorMessages);
      
    return res.status(400).json({
      success: false,
      status: 'error',
      message: "Validation Failed",
      errors: errorMessages,
    });
  }

  // Success path
  req.body = result.data;
  next();
};