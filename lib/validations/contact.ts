import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Naam moet minimaal 2 karakters zijn")
    .max(100, "Naam mag maximaal 100 karakters zijn")
    .trim(),
  email: z.string().email("Ongeldig e-mailadres"),
  subject: z
    .string()
    .min(2, "Onderwerp moet minimaal 2 karakters zijn")
    .max(200, "Onderwerp mag maximaal 200 karakters zijn")
    .trim(),
  message: z
    .string()
    .min(10, "Bericht moet minimaal 10 karakters zijn")
    .max(5000, "Bericht mag maximaal 5000 karakters zijn")
    .trim(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
