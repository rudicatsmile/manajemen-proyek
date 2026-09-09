import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
]);

export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);

export const projectMemberRoleEnum = pgEnum("project_member_role", [
  "project_manager",
  "frontend",
  "backend",
  "fullstack",
  "designer",
  "qa",
  "other",
]);

export const activityActionEnum = pgEnum("activity_action", [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_STATUS_CHANGED",
  "PROJECT_DELETED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "NOTE_DELETED",
]);

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("members_clerk_id_idx").on(table.clerkId)]
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    status: projectStatusEnum("status").notNull().default("planning"),
    frontendTech: text("frontend_tech"),
    backendTech: text("backend_tech"),
    databaseTech: text("database_tech"),
    repositoryUrl: text("repository_url"),
    credentialUsername: text("credential_username"),
    credentialPassword: text("credential_password"),
    credentialIv: text("credential_iv"),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("projects_name_idx").on(table.name),
    index("projects_client_id_idx").on(table.clientId),
    index("projects_status_idx").on(table.status),
  ]
);

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    role: projectMemberRoleEnum("role").notNull().default("other"),
    assignedBy: uuid("assigned_by").references(() => members.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.memberId] }),
    index("project_members_member_idx").on(table.memberId),
  ]
);

export const projectNotes = pgTable(
  "project_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("project_notes_project_idx").on(table.projectId)]
);

export const projectCredentials = pgTable(
  "project_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("other"),
    host: text("host"),
    port: text("port"),
    username: text("username").notNull(),
    password: text("password").notNull(),
    iv: text("iv").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("project_credentials_project_idx").on(table.projectId)]
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: text("project_id").notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    action: activityActionEnum("action").notNull(),
    entityType: text("entity_type").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("activity_logs_project_idx").on(table.projectId),
    index("activity_logs_created_at_idx").on(table.createdAt),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  createdBy: one(members, {
    fields: [projects.createdById],
    references: [members.id],
  }),
  projectMembers: many(projectMembers),
  notes: many(projectNotes),
  credentials: many(projectCredentials),
}));

export const projectCredentialsRelations = relations(projectCredentials, ({ one }) => ({
  project: one(projects, {
    fields: [projectCredentials.projectId],
    references: [projects.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  member: one(members, {
    fields: [projectMembers.memberId],
    references: [members.id],
  }),
}));

export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
  project: one(projects, {
    fields: [projectNotes.projectId],
    references: [projects.id],
  }),
  author: one(members, {
    fields: [projectNotes.authorId],
    references: [members.id],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}));

export const membersRelations = relations(members, ({ many }) => ({
  createdProjects: many(projects),
  projectMemberships: many(projectMembers),
  notes: many(projectNotes),
  activityLogs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  actor: one(members, {
    fields: [activityLogs.actorId],
    references: [members.id],
  }),
}));

