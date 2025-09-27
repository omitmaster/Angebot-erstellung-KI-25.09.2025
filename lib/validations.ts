import { z } from "zod"

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  userType: z.enum(["handwerker", "kunde"], {
    errorMap: () => ({ message: "Benutzertyp muss 'handwerker' oder 'kunde' sein" }),
  }),
  companyName: z.string().optional(),
  phone: z.string().optional(),
})

export const userLoginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
})

// Profile validation schemas
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich").optional(),
  lastName: z.string().min(1, "Nachname ist erforderlich").optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url("Ungültige Website-URL").optional().or(z.literal("")),
  description: z.string().optional(),
})

// Project validation schemas
export const projectCreateSchema = z.object({
  title: z.string().min(1, "Projekttitel ist erforderlich"),
  siteAddress: z.string().min(1, "Projektadresse ist erforderlich"),
  customerId: z.string().uuid("Ungültige Kunden-ID"),
})

export const projectUpdateSchema = z.object({
  title: z.string().min(1, "Projekttitel ist erforderlich").optional(),
  siteAddress: z.string().min(1, "Projektadresse ist erforderlich").optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).optional(),
})

// Offer validation schemas
export const offerCreateSchema = z.object({
  projectId: z.string().uuid("Ungültige Projekt-ID"),
  positions: z
    .array(
      z.object({
        description: z.string().min(1, "Positionsbeschreibung ist erforderlich"),
        qty: z.number().positive("Menge muss positiv sein"),
        unit: z.string().min(1, "Einheit ist erforderlich"),
        laborRate: z.number().nonnegative("Arbeitsstundensatz muss nicht-negativ sein"),
        materialCost: z.number().nonnegative("Materialkosten müssen nicht-negativ sein"),
        minutes: z.number().nonnegative("Arbeitszeit muss nicht-negativ sein"),
      }),
    )
    .min(1, "Mindestens eine Position ist erforderlich"),
})

// Customer validation schemas
export const customerCreateSchema = z.object({
  name: z.string().min(1, "Kundenname ist erforderlich"),
  person: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Material validation schemas
export const materialCreateSchema = z.object({
  projectId: z.string().uuid("Ungültige Projekt-ID"),
  title: z.string().min(1, "Materialtitel ist erforderlich"),
  sku: z.string().optional(),
  supplier: z.string().optional(),
  qty: z.number().positive("Menge muss positiv sein"),
  unit: z.string().min(1, "Einheit ist erforderlich"),
  priceEstimate: z.number().nonnegative("Preisschätzung muss nicht-negativ sein"),
})

// Generic validation helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message).join(", ")
    throw new Error(`Validierungsfehler: ${errors}`)
  }
  return result.data
}

// API request validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return validateData(schema, data)
  }
}
