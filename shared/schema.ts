import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, time, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  avatarUrl: text("avatar_url"),
  department: text("department"),
  position: text("position"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// SLA definitions
export const slaDefinitions = pgTable("sla_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // critical, high, medium, low
  responseTime: integer("response_time").notNull(), // in minutes
  resolutionTime: integer("resolution_time").notNull(), // in minutes
  businessHoursOnly: boolean("business_hours_only").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  active: boolean("active").default(true),
});

export const insertSlaDefinitionSchema = createInsertSchema(slaDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Business hours
export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isWorkingDay: boolean("is_working_day").default(true),
});

export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({
  id: true,
});

// Assets (CMDB)
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetTag: text("asset_tag").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hardware, software, service, etc.
  status: text("status").notNull().default("active"), // active, inactive, maintenance, retired
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: date("purchase_date"),
  warrantyExpiryDate: date("warranty_expiry_date"),
  location: text("location"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  specifications: jsonb("specifications"), // CPU, RAM, storage, etc. for hardware
  licenseInfo: jsonb("license_info"), // license key, seats, expiry for software
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastAuditDate: timestamp("last_audit_date"),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Problems management
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  problemNumber: text("problem_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"),
  impact: text("impact").notNull().default("medium"), // high, medium, low
  category: text("category").notNull(),
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  knownErrors: jsonb("known_errors"), // documented issues
  workaround: text("workaround"),
  affectedServices: text("affected_services").array(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertProblemSchema = createInsertSchema(problems).omit({
  id: true,
  problemNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

// Changes management
export const changes = pgTable("changes", {
  id: serial("id").primaryKey(),
  changeNumber: text("change_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // normal, standard, emergency
  category: text("category").notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved, in_progress, completed, rejected, cancelled
  priority: text("priority").notNull().default("medium"),
  impact: text("impact").notNull().default("medium"),
  risk: text("risk").notNull().default("medium"),
  implementationPlan: text("implementation_plan"),
  backoutPlan: text("backout_plan"),
  testPlan: text("test_plan"),
  scheduledStartTime: timestamp("scheduled_start_time"),
  scheduledEndTime: timestamp("scheduled_end_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  affectedServices: text("affected_services").array(),
  affectedAssets: integer("affected_assets").array(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChangeSchema = createInsertSchema(changes).omit({
  id: true,
  changeNumber: true,
  createdAt: true,
  updatedAt: true,
  approvalDate: true,
  actualStartTime: true,
  actualEndTime: true,
});

// Tickets table (enhanced with SLA and Problem/Change relationships)
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, on_hold, waiting_for_customer, resolved, closed
  priority: text("priority").notNull().default("medium"), // critical, high, medium, low
  type: text("type").notNull().default("incident"), // incident, service_request, problem, change
  category: text("category").notNull(),
  impact: text("impact").default("medium"), // high, medium, low
  requesterId: integer("requester_id").notNull().references(() => users.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  dueDate: timestamp("due_date"),
  responseDeadline: timestamp("response_deadline"),
  resolutionDeadline: timestamp("resolution_deadline"),
  timeSpent: integer("time_spent"), // in minutes
  slaId: integer("sla_id").references(() => slaDefinitions.id),
  slaStatus: text("sla_status").default("on_track"), // on_track, at_risk, breached, on_hold, completed
  problemId: integer("problem_id").references(() => problems.id),
  changeId: integer("change_id").references(() => changes.id),
  relatedAssets: integer("related_assets").array(),
  timeToFirstResponse: integer("time_to_first_response"), // in minutes
  satisfactionScore: numeric("satisfaction_score", { precision: 2, scale: 1 }), // 1-5 scale
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  firstResponseAt: true,
  resolvedAt: true,
  closedAt: true,
  responseDeadline: true,
  resolutionDeadline: true,
});

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  views: integer("views").default(0),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  published: boolean("published").default(false),
  tags: text("tags").array(),
  relatedAssets: integer("related_assets").array(),
  relatedProblems: integer("related_problems").array(),
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

// Service catalog items
export const serviceItems = pgTable("service_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  estimatedTime: text("estimated_time"),
  approvalRequired: boolean("approval_required").default(false),
  formData: jsonb("form_data"),
  slaId: integer("sla_id").references(() => slaDefinitions.id),
  workflowSteps: jsonb("workflow_steps"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceItemSchema = createInsertSchema(serviceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Comments on tickets
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  attachments: text("attachments").array(),
  isInternal: boolean("is_internal").default(false), // For internal notes not visible to requesters
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = z.infer<typeof insertServiceItemSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type SlaDefinition = typeof slaDefinitions.$inferSelect;
export type InsertSlaDefinition = z.infer<typeof insertSlaDefinitionSchema>;

export type BusinessHour = typeof businessHours.$inferSelect;
export type InsertBusinessHour = z.infer<typeof insertBusinessHoursSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;

export type Change = typeof changes.$inferSelect;
export type InsertChange = z.infer<typeof insertChangeSchema>;
