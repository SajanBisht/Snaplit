import { z } from "zod";

export const SignupValidation = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});
export const SigninValidation = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});
export const PostValidation = z.object({
    caption: z.string()
        .min(5, { message: "Caption must be at least 5 characters." })
        .max(2200, { message: "Caption must be at most 2200 characters." }),

    file: z.array(z.instanceof(File), { message: "Invalid file format." }),

    location: z.string()
        .min(2, { message: "Location must be at least 2 characters." })
        .max(100, { message: "Location must be at most 100 characters." }),
        
    tags: z.string().optional(),
});

export const ReelValidation = z.object({
    caption: z
      .string()
      .min(5, { message: "Caption must be at least 5 characters." })
      .max(2200, { message: "Caption must be at most 2200 characters." }),
  
    file: z
      .array(z.instanceof(File), { message: "Invalid file format." })
      .min(1, { message: "Please upload a video." }),
  
    location: z
      .string()
      .min(2, { message: "Location must be at least 2 characters." })
      .max(100, { message: "Location must be at most 100 characters." }),
  
    tags: z.string().optional(),
    audio: z.string().optional(),
  
    duration: z.coerce.number().min(15).max(60).optional(),
  });
  