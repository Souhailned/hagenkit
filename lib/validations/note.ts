import { z } from "zod";

// ============================================
// NOTE ENUMS
// ============================================

export const pmNoteTypeEnum = z.enum(["GENERAL", "MEETING", "AUDIO"]);
export const pmNoteStatusEnum = z.enum(["COMPLETED", "PROCESSING"]);

// ============================================
// NOTE SCHEMAS
// ============================================

export const createNoteSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  content: z.string().max(50000, "Content is too long").optional(),
  noteType: pmNoteTypeEnum.default("GENERAL"),
});

export const updateNoteSchema = z.object({
  id: z.string().min(1, "Note ID is required"),
  title: z.string().min(1, "Title is required").max(500, "Title is too long").optional(),
  content: z.string().max(50000, "Content is too long").optional().or(z.null()),
});

export const deleteNoteSchema = z.object({
  id: z.string().min(1, "Note ID is required"),
});

export const listNotesSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

// ============================================
// FILE SCHEMAS
// ============================================

export const createProjectFileSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "File name is required").max(500, "Name is too long"),
  url: z.string().url("Invalid URL"),
  size: z.number().int().min(0, "Size must be non-negative"),
  type: z.enum(["PDF", "ZIP", "FIGMA", "DOC", "IMAGE", "OTHER"]).default("OTHER"),
});

export const deleteProjectFileSchema = z.object({
  id: z.string().min(1, "File ID is required"),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type PMNoteType = z.infer<typeof pmNoteTypeEnum>;
export type PMNoteStatus = z.infer<typeof pmNoteStatusEnum>;

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
export type ListNotesInput = z.infer<typeof listNotesSchema>;

export type CreateProjectFileInput = z.infer<typeof createProjectFileSchema>;
export type DeleteProjectFileInput = z.infer<typeof deleteProjectFileSchema>;
