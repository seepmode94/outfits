import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  jsonb,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────
export const genderEnum = pgEnum("gender", [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
]);

export const garmentCategoryEnum = pgEnum("garment_category", [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "footwear",
  "accessory",
]);

export const formalityEnum = pgEnum("formality", [
  "casual",
  "smart_casual",
  "formal",
  "sport",
]);

export const seasonEnum = pgEnum("season", [
  "spring",
  "summer",
  "autumn",
  "winter",
]);

export const outfitStatusEnum = pgEnum("outfit_status", [
  "suggested",
  "saved",
  "worn",
]);

export const feedbackValueEnum = pgEnum("feedback_value", ["like", "dislike"]);

// ─────────────────────────────────────────────────────────────
// Auth.js (next-auth) — geridas pelo Drizzle adapter
// ─────────────────────────────────────────────────────────────
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// ─────────────────────────────────────────────────────────────
// Perfil (1:1 com user)
// ─────────────────────────────────────────────────────────────
export const profiles = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  gender: genderEnum("gender"),
  preferredStyles: text("preferred_styles").array(),
  sizes: jsonb("sizes").$type<Record<string, string>>(),
  district: text("district"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────
// Peças de roupa
// ─────────────────────────────────────────────────────────────
export const garments = pgTable("garment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  category: garmentCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),
  primaryColor: text("primary_color"),
  colors: text("colors").array(),
  pattern: text("pattern"),
  formality: formalityEnum("formality"),
  seasons: seasonEnum("seasons").array(),
  material: text("material"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────────────────────
// Outfits (sugestões geradas / guardadas)
// ─────────────────────────────────────────────────────────────
export const outfits = pgTable("outfit", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  occasion: text("occasion"),
  context: jsonb("context").$type<{
    weather?: { temperatureC?: number; condition?: string };
    season?: string;
    location?: string;
  }>(),
  explanation: text("explanation"),
  status: outfitStatusEnum("status").default("suggested").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─────────────────────────────────────────────────────────────
// Junção outfit ↔ peças (N:N)
// ─────────────────────────────────────────────────────────────
export const outfitGarments = pgTable(
  "outfit_garment",
  {
    outfitId: uuid("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    garmentId: uuid("garment_id")
      .notNull()
      .references(() => garments.id, { onDelete: "cascade" }),
    role: text("role"),
  },
  (t) => [primaryKey({ columns: [t.outfitId, t.garmentId] })],
);

// ─────────────────────────────────────────────────────────────
// Feedback (gostei / não gostei)
// ─────────────────────────────────────────────────────────────
export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  outfitId: uuid("outfit_id").references(() => outfits.id, {
    onDelete: "cascade",
  }),
  garmentId: uuid("garment_id").references(() => garments.id, {
    onDelete: "cascade",
  }),
  value: feedbackValueEnum("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─────────────────────────────────────────────────────────────
// Relações (para queries com joins)
// ─────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  garments: many(garments),
  outfits: many(outfits),
}));

export const garmentsRelations = relations(garments, ({ one, many }) => ({
  user: one(users, { fields: [garments.userId], references: [users.id] }),
  outfitGarments: many(outfitGarments),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(users, { fields: [outfits.userId], references: [users.id] }),
  outfitGarments: many(outfitGarments),
}));

export const outfitGarmentsRelations = relations(outfitGarments, ({ one }) => ({
  outfit: one(outfits, {
    fields: [outfitGarments.outfitId],
    references: [outfits.id],
  }),
  garment: one(garments, {
    fields: [outfitGarments.garmentId],
    references: [garments.id],
  }),
}));

// ─────────────────────────────────────────────────────────────
// Tipos inferidos
// ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Garment = typeof garments.$inferSelect;
export type NewGarment = typeof garments.$inferInsert;
export type Outfit = typeof outfits.$inferSelect;
export type NewOutfit = typeof outfits.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
