import { 
  users, User, InsertUser, 
  tickets, Ticket, InsertTicket,
  knowledgeArticles, KnowledgeArticle, InsertKnowledgeArticle,
  serviceItems, ServiceItem, InsertServiceItem,
  ticketComments, TicketComment, InsertTicketComment,
  slaDefinitions, SlaDefinition, InsertSlaDefinition,
  businessHours, BusinessHour, InsertBusinessHour,
  assets, Asset, InsertAsset,
  problems, Problem, InsertProblem,
  changes, Change, InsertChange
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ticket operations
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined>;
  getTicketsByStatus(status: string): Promise<Ticket[]>;
  getTicketsByPriority(priority: string): Promise<Ticket[]>;
  getTicketsByAssignee(assigneeId: number): Promise<Ticket[]>;
  getTicketsByRequester(requesterId: number): Promise<Ticket[]>;
  
  // Knowledge article operations
  getKnowledgeArticles(): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: number, article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined>;
  incrementArticleViews(id: number): Promise<KnowledgeArticle | undefined>;

  // Service catalog operations
  getServiceItems(): Promise<ServiceItem[]>;
  getServiceItem(id: number): Promise<ServiceItem | undefined>;
  createServiceItem(item: InsertServiceItem): Promise<ServiceItem>;
  updateServiceItem(id: number, item: Partial<ServiceItem>): Promise<ServiceItem | undefined>;

  // Comment operations
  getTicketComments(ticketId: number): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  
  // SLA Management
  getSlaDefinitions(): Promise<SlaDefinition[]>;
  getSlaDefinition(id: number): Promise<SlaDefinition | undefined>;
  createSlaDefinition(sla: InsertSlaDefinition): Promise<SlaDefinition>;
  updateSlaDefinition(id: number, sla: Partial<SlaDefinition>): Promise<SlaDefinition | undefined>;
  
  // Business Hours
  getBusinessHours(): Promise<BusinessHour[]>;
  createBusinessHour(businessHour: InsertBusinessHour): Promise<BusinessHour>;
  updateBusinessHour(id: number, businessHour: Partial<BusinessHour>): Promise<BusinessHour | undefined>;
  
  // Asset Management
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetByTag(assetTag: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<Asset>): Promise<Asset | undefined>;
  getAssetsByType(type: string): Promise<Asset[]>;
  getAssetsByStatus(status: string): Promise<Asset[]>;
  getAssetsByAssignee(assigneeId: number): Promise<Asset[]>;
  
  // Problem Management
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  getProblemByNumber(problemNumber: string): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<Problem>): Promise<Problem | undefined>;
  getProblemsByStatus(status: string): Promise<Problem[]>;
  getProblemsByPriority(priority: string): Promise<Problem[]>;
  
  // Change Management
  getChanges(): Promise<Change[]>;
  getChange(id: number): Promise<Change | undefined>;
  getChangeByNumber(changeNumber: string): Promise<Change | undefined>;
  createChange(change: InsertChange): Promise<Change>;
  updateChange(id: number, change: Partial<Change>): Promise<Change | undefined>;
  getChangesByStatus(status: string): Promise<Change[]>;
  getChangesByType(type: string): Promise<Change[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private knowledgeArticles: Map<number, KnowledgeArticle>;
  private serviceItems: Map<number, ServiceItem>;
  private ticketComments: Map<number, TicketComment>;
  
  private userId: number;
  private ticketId: number;
  private articleId: number;
  private serviceItemId: number;
  private commentId: number;
  private ticketCounter: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.knowledgeArticles = new Map();
    this.serviceItems = new Map();
    this.ticketComments = new Map();
    
    this.userId = 1;
    this.ticketId = 1;
    this.articleId = 1;
    this.serviceItemId = 1;
    this.commentId = 1;
    this.ticketCounter = 1000;
    
    // Seed some initial data
    this.seedData();
  }

  private seedData() {
    // Sample users
    const users: InsertUser[] = [
      {
        username: "admin",
        password: "admin123", // in a real app, this would be hashed
        fullName: "Admin User",
        email: "admin@example.com",
        role: "admin",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      },
      {
        username: "technician1",
        password: "tech123",
        fullName: "James Wilson",
        email: "james@example.com",
        role: "technician",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      },
      {
        username: "technician2",
        password: "tech123",
        fullName: "Sarah Parker",
        email: "sarah@example.com",
        role: "technician",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      },
      {
        username: "technician3",
        password: "tech123",
        fullName: "Michael Brown",
        email: "michael@example.com",
        role: "technician",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      },
      {
        username: "user1",
        password: "user123",
        fullName: "Alex Johnson",
        email: "alex@example.com",
        role: "user",
        avatarUrl: null
      },
      {
        username: "user2",
        password: "user123",
        fullName: "Maria Garcia",
        email: "maria@example.com",
        role: "user",
        avatarUrl: null
      },
      {
        username: "user3",
        password: "user123",
        fullName: "Robert Lee",
        email: "robert@example.com",
        role: "user",
        avatarUrl: null
      },
      {
        username: "user4",
        password: "user123",
        fullName: "Jennifer Kim",
        email: "jennifer@example.com",
        role: "user",
        avatarUrl: null
      },
      {
        username: "user5",
        password: "user123",
        fullName: "David Wong",
        email: "david@example.com",
        role: "user",
        avatarUrl: null
      }
    ];

    users.forEach(user => this.createUser(user));

    // Sample tickets
    const tickets: InsertTicket[] = [
      {
        subject: "Unable to access network drive",
        description: "I can't access the shared network drive. Getting error message: 'Access denied'.",
        status: "in_progress",
        priority: "high",
        type: "incident",
        category: "network",
        requesterId: 5, // Alex Johnson
        assigneeId: 2, // James Wilson
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        timeSpent: 0,
        slaStatus: "on_track"
      },
      {
        subject: "Email service down for marketing department",
        description: "The entire marketing team can't send or receive emails since 9 AM today.",
        status: "open",
        priority: "critical",
        type: "incident",
        category: "email",
        requesterId: 6, // Maria Garcia
        assigneeId: 3, // Sarah Parker
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        timeSpent: 0,
        slaStatus: "at_risk"
      },
      {
        subject: "Printer not functioning in Finance department",
        description: "The main printer in the finance department is showing error code E-723.",
        status: "resolved",
        priority: "medium",
        type: "incident",
        category: "hardware",
        requesterId: 7, // Robert Lee
        assigneeId: 4, // Michael Brown
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        timeSpent: 120, // 2 hours
        slaStatus: "completed"
      },
      {
        subject: "VPN connection issue for remote workers",
        description: "Remote employees are reporting intermittent VPN disconnections.",
        status: "open",
        priority: "high",
        type: "incident",
        category: "network",
        requesterId: 8, // Jennifer Kim
        assigneeId: null, // Unassigned
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        timeSpent: 0,
        slaStatus: "on_track"
      },
      {
        subject: "Software license expired for design team",
        description: "Adobe Creative Cloud licenses expired for the design team, affecting 12 users.",
        status: "on_hold",
        priority: "medium",
        type: "service_request",
        category: "software",
        requesterId: 9, // David Wong
        assigneeId: 2, // James Wilson
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        timeSpent: 30, // 30 minutes
        slaStatus: "on_hold"
      }
    ];

    tickets.forEach(ticket => this.createTicket(ticket));

    // Sample knowledge articles
    const articles: InsertKnowledgeArticle[] = [
      {
        title: "VPN Connection Troubleshooting",
        content: "Learn how to diagnose and resolve common VPN connection issues, including timeout errors, authentication problems, and split tunneling configuration.",
        category: "network",
        authorId: 2, // James Wilson
        published: true,
        tags: ["vpn", "network", "remote access", "troubleshooting"]
      },
      {
        title: "Office 365 Email Setup Guide",
        content: "Step-by-step guide for setting up Office 365 email accounts on various devices and email clients, including troubleshooting common configuration issues.",
        category: "software",
        authorId: 3, // Sarah Parker
        published: true,
        tags: ["office 365", "email", "configuration", "setup"]
      },
      {
        title: "Printer Connectivity Solutions",
        content: "Comprehensive guide to resolving common printer connectivity issues, including network printer setup, driver installation, and hardware troubleshooting.",
        category: "hardware",
        authorId: 4, // Michael Brown
        published: true,
        tags: ["printer", "hardware", "network", "drivers"]
      }
    ];

    articles.forEach(article => this.createKnowledgeArticle(article));

    // Sample service catalog items
    const serviceItems: InsertServiceItem[] = [
      {
        name: "New Employee Setup",
        description: "Setup of equipment, accounts, and access for new employees.",
        category: "onboarding",
        estimatedTime: "1-2 business days",
        approvalRequired: true,
        formData: {
          fields: [
            { name: "employeeName", label: "Employee Name", type: "text", required: true },
            { name: "startDate", label: "Start Date", type: "date", required: true },
            { name: "department", label: "Department", type: "select", options: ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"], required: true },
            { name: "manager", label: "Manager", type: "text", required: true },
            { name: "requiredEquipment", label: "Required Equipment", type: "checkbox", options: ["Laptop", "Desktop", "Phone", "Monitor", "Headset"], required: true }
          ]
        }
      },
      {
        name: "Software Installation Request",
        description: "Request installation of software on company devices.",
        category: "software",
        estimatedTime: "1 business day",
        approvalRequired: true,
        formData: {
          fields: [
            { name: "softwareName", label: "Software Name", type: "text", required: true },
            { name: "businessJustification", label: "Business Justification", type: "textarea", required: true },
            { name: "urgency", label: "Urgency", type: "select", options: ["Low", "Medium", "High"], required: true }
          ]
        }
      },
      {
        name: "Password Reset",
        description: "Reset password for company accounts.",
        category: "access",
        estimatedTime: "1-4 hours",
        approvalRequired: false,
        formData: {
          fields: [
            { name: "accountType", label: "Account Type", type: "select", options: ["Email", "VPN", "Internal System", "Other"], required: true },
            { name: "username", label: "Username", type: "text", required: true },
            { name: "otherInformation", label: "Additional Information", type: "textarea", required: false }
          ]
        }
      },
      {
        name: "VPN Access Request",
        description: "Request access to company VPN for remote work.",
        category: "access",
        estimatedTime: "1 business day",
        approvalRequired: true,
        formData: {
          fields: [
            { name: "purpose", label: "Purpose", type: "textarea", required: true },
            { name: "duration", label: "Access Duration", type: "select", options: ["Temporary (1 week)", "Temporary (1 month)", "Permanent"], required: true },
            { name: "deviceType", label: "Device Type", type: "select", options: ["Company Device", "Personal Device"], required: true }
          ]
        }
      }
    ];

    serviceItems.forEach(item => this.createServiceItem(item));
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      // Ensure these fields are properly defined to satisfy the User type
      role: insertUser.role || 'user',
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(
      (ticket) => ticket.ticketNumber === ticketNumber
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.ticketId++;
    const ticketNumber = `INC-${this.ticketCounter++}`;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const ticket: Ticket = { 
      ...insertTicket, 
      id, 
      ticketNumber, 
      createdAt, 
      updatedAt,
      // Ensure these fields are properly defined to satisfy the Ticket type
      status: insertTicket.status || 'open',
      priority: insertTicket.priority || 'medium',
      type: insertTicket.type || 'incident',
      assigneeId: insertTicket.assigneeId || null,
      dueDate: insertTicket.dueDate || null,
      timeSpent: insertTicket.timeSpent || null,
      slaStatus: insertTicket.slaStatus || 'on_track'
    };
    
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: number, ticketUpdate: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket: Ticket = {
      ...ticket,
      ...ticketUpdate,
      updatedAt: new Date()
    };
    
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.status === status
    );
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.priority === priority
    );
  }

  async getTicketsByAssignee(assigneeId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.assigneeId === assigneeId
    );
  }

  async getTicketsByRequester(requesterId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.requesterId === requesterId
    );
  }

  // Knowledge article operations
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return Array.from(this.knowledgeArticles.values());
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    return this.knowledgeArticles.get(id);
  }

  async createKnowledgeArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const id = this.articleId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const views = 0;
    
    const article: KnowledgeArticle = {
      ...insertArticle,
      id,
      createdAt,
      updatedAt,
      views,
      // Ensure these fields are properly defined to satisfy the KnowledgeArticle type
      published: insertArticle.published !== undefined ? insertArticle.published : false,
      tags: insertArticle.tags || null
    };
    
    this.knowledgeArticles.set(id, article);
    return article;
  }

  async updateKnowledgeArticle(id: number, articleUpdate: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const article = this.knowledgeArticles.get(id);
    if (!article) return undefined;

    const updatedArticle: KnowledgeArticle = {
      ...article,
      ...articleUpdate,
      updatedAt: new Date()
    };
    
    this.knowledgeArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async incrementArticleViews(id: number): Promise<KnowledgeArticle | undefined> {
    const article = this.knowledgeArticles.get(id);
    if (!article) return undefined;

    const updatedArticle: KnowledgeArticle = {
      ...article,
      views: (article.views || 0) + 1
    };
    
    this.knowledgeArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  // Service catalog operations
  async getServiceItems(): Promise<ServiceItem[]> {
    return Array.from(this.serviceItems.values());
  }

  async getServiceItem(id: number): Promise<ServiceItem | undefined> {
    return this.serviceItems.get(id);
  }

  async createServiceItem(insertItem: InsertServiceItem): Promise<ServiceItem> {
    const id = this.serviceItemId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const serviceItem: ServiceItem = {
      ...insertItem,
      id,
      createdAt,
      updatedAt,
      // Ensure these fields are properly defined to satisfy the ServiceItem type
      estimatedTime: insertItem.estimatedTime || null,
      approvalRequired: insertItem.approvalRequired !== undefined ? insertItem.approvalRequired : false,
      formData: insertItem.formData || null
    };
    
    this.serviceItems.set(id, serviceItem);
    return serviceItem;
  }

  async updateServiceItem(id: number, itemUpdate: Partial<ServiceItem>): Promise<ServiceItem | undefined> {
    const item = this.serviceItems.get(id);
    if (!item) return undefined;

    const updatedItem: ServiceItem = {
      ...item,
      ...itemUpdate,
      updatedAt: new Date()
    };
    
    this.serviceItems.set(id, updatedItem);
    return updatedItem;
  }

  // Comment operations
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return Array.from(this.ticketComments.values()).filter(
      (comment) => comment.ticketId === ticketId
    );
  }

  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const id = this.commentId++;
    const createdAt = new Date();
    
    const comment: TicketComment = {
      ...insertComment,
      id,
      createdAt,
      // Ensure these fields are properly defined to satisfy the TicketComment type
      attachments: insertComment.attachments || null
    };
    
    this.ticketComments.set(id, comment);
    return comment;
  }
}

// Import Supabase storage
import { supabaseStorage } from './supabase-storage';

// Use Supabase storage instead of MemStorage
// Use MemStorage for now until Supabase tables are created
// export const storage = supabaseStorage;
import { db } from "./db";
import { eq, and, desc, sql, like, or, isNull, not } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  private ticketCounter: number = 1000;

  constructor() {
    // Initialize the ticket counter
    this.initTicketCounter();
  }

  private async initTicketCounter() {
    try {
      const latestTicket = await db
        .select({ ticketNumber: tickets.ticketNumber })
        .from(tickets)
        .orderBy(desc(tickets.id))
        .limit(1);

      if (latestTicket && latestTicket.length > 0 && latestTicket[0].ticketNumber) {
        const numericPart = parseInt(latestTicket[0].ticketNumber.replace('T-', ''), 10);
        if (!isNaN(numericPart)) {
          this.ticketCounter = numericPart + 1;
        }
      }
    } catch (error) {
      console.error('Error initializing ticket counter:', error);
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const results = await db.select().from(tickets).where(eq(tickets.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const results = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber));
    return results.length > 0 ? results[0] : undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const ticketNumber = `T-${this.ticketCounter++}`;
    const result = await db.insert(tickets)
      .values({
        ...insertTicket,
        ticketNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateTicket(id: number, ticketUpdate: Partial<Ticket>): Promise<Ticket | undefined> {
    const results = await db.update(tickets)
      .set({
        ...ticketUpdate,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.status, status));
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.priority, priority));
  }

  async getTicketsByAssignee(assigneeId: number): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.assigneeId, assigneeId));
  }

  async getTicketsByRequester(requesterId: number): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.requesterId, requesterId));
  }

  // Knowledge article operations
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return await db.select().from(knowledgeArticles);
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const results = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createKnowledgeArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const result = await db.insert(knowledgeArticles)
      .values({
        ...insertArticle,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateKnowledgeArticle(id: number, articleUpdate: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const results = await db.update(knowledgeArticles)
      .set({
        ...articleUpdate,
        updatedAt: new Date()
      })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async incrementArticleViews(id: number): Promise<KnowledgeArticle | undefined> {
    const results = await db.update(knowledgeArticles)
      .set({
        views: sql`${knowledgeArticles.views} + 1`,
        updatedAt: new Date()
      })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  // Service catalog operations
  async getServiceItems(): Promise<ServiceItem[]> {
    return await db.select().from(serviceItems);
  }

  async getServiceItem(id: number): Promise<ServiceItem | undefined> {
    const results = await db.select().from(serviceItems).where(eq(serviceItems.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createServiceItem(insertItem: InsertServiceItem): Promise<ServiceItem> {
    const result = await db.insert(serviceItems)
      .values({
        ...insertItem,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateServiceItem(id: number, itemUpdate: Partial<ServiceItem>): Promise<ServiceItem | undefined> {
    const results = await db.update(serviceItems)
      .set({
        ...itemUpdate,
        updatedAt: new Date()
      })
      .where(eq(serviceItems.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  // Comment operations
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return await db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId));
  }

  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const result = await db.insert(ticketComments)
      .values({
        ...insertComment,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  // SLA Management
  async getSlaDefinitions(): Promise<SlaDefinition[]> {
    return await db.select().from(slaDefinitions);
  }

  async getSlaDefinition(id: number): Promise<SlaDefinition | undefined> {
    const results = await db.select().from(slaDefinitions).where(eq(slaDefinitions.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createSlaDefinition(insertSla: InsertSlaDefinition): Promise<SlaDefinition> {
    const result = await db.insert(slaDefinitions)
      .values({
        ...insertSla,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateSlaDefinition(id: number, slaUpdate: Partial<SlaDefinition>): Promise<SlaDefinition | undefined> {
    const results = await db.update(slaDefinitions)
      .set({
        ...slaUpdate,
        updatedAt: new Date()
      })
      .where(eq(slaDefinitions.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  // Business Hours
  async getBusinessHours(): Promise<BusinessHour[]> {
    return await db.select().from(businessHours);
  }

  async createBusinessHour(insertBusinessHour: InsertBusinessHour): Promise<BusinessHour> {
    const result = await db.insert(businessHours)
      .values({
        ...insertBusinessHour,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateBusinessHour(id: number, businessHourUpdate: Partial<BusinessHour>): Promise<BusinessHour | undefined> {
    const results = await db.update(businessHours)
      .set({
        ...businessHourUpdate,
        updatedAt: new Date()
      })
      .where(eq(businessHours.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  // Asset Management
  async getAssets(): Promise<Asset[]> {
    return await db.select().from(assets);
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const results = await db.select().from(assets).where(eq(assets.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getAssetByTag(assetTag: string): Promise<Asset | undefined> {
    const results = await db.select().from(assets).where(eq(assets.assetTag, assetTag));
    return results.length > 0 ? results[0] : undefined;
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const result = await db.insert(assets)
      .values({
        ...insertAsset,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateAsset(id: number, assetUpdate: Partial<Asset>): Promise<Asset | undefined> {
    const results = await db.update(assets)
      .set({
        ...assetUpdate,
        updatedAt: new Date()
      })
      .where(eq(assets.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async getAssetsByType(type: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.type, type));
  }

  async getAssetsByStatus(status: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.status, status));
  }

  async getAssetsByAssignee(assigneeId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.assignedToId, assigneeId));
  }

  // Problem Management
  async getProblems(): Promise<Problem[]> {
    return await db.select().from(problems);
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const results = await db.select().from(problems).where(eq(problems.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getProblemByNumber(problemNumber: string): Promise<Problem | undefined> {
    const results = await db.select().from(problems).where(eq(problems.problemNumber, problemNumber));
    return results.length > 0 ? results[0] : undefined;
  }

  async createProblem(insertProblem: InsertProblem): Promise<Problem> {
    // Generate a problem number in the format P-XXXX
    const latestProblem = await db
      .select({ problemNumber: problems.problemNumber })
      .from(problems)
      .orderBy(desc(problems.id))
      .limit(1);

    let problemCounter = 1000;
    if (latestProblem && latestProblem.length > 0 && latestProblem[0].problemNumber) {
      const numericPart = parseInt(latestProblem[0].problemNumber.replace('P-', ''), 10);
      if (!isNaN(numericPart)) {
        problemCounter = numericPart + 1;
      }
    }

    const problemNumber = `P-${problemCounter}`;
    
    const result = await db.insert(problems)
      .values({
        ...insertProblem,
        problemNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateProblem(id: number, problemUpdate: Partial<Problem>): Promise<Problem | undefined> {
    const results = await db.update(problems)
      .set({
        ...problemUpdate,
        updatedAt: new Date()
      })
      .where(eq(problems.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async getProblemsByStatus(status: string): Promise<Problem[]> {
    return await db.select().from(problems).where(eq(problems.status, status));
  }

  async getProblemsByPriority(priority: string): Promise<Problem[]> {
    return await db.select().from(problems).where(eq(problems.priority, priority));
  }

  // Change Management
  async getChanges(): Promise<Change[]> {
    return await db.select().from(changes);
  }

  async getChange(id: number): Promise<Change | undefined> {
    const results = await db.select().from(changes).where(eq(changes.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getChangeByNumber(changeNumber: string): Promise<Change | undefined> {
    const results = await db.select().from(changes).where(eq(changes.changeNumber, changeNumber));
    return results.length > 0 ? results[0] : undefined;
  }

  async createChange(insertChange: InsertChange): Promise<Change> {
    // Generate a change number in the format C-XXXX
    const latestChange = await db
      .select({ changeNumber: changes.changeNumber })
      .from(changes)
      .orderBy(desc(changes.id))
      .limit(1);

    let changeCounter = 1000;
    if (latestChange && latestChange.length > 0 && latestChange[0].changeNumber) {
      const numericPart = parseInt(latestChange[0].changeNumber.replace('C-', ''), 10);
      if (!isNaN(numericPart)) {
        changeCounter = numericPart + 1;
      }
    }

    const changeNumber = `C-${changeCounter}`;
    
    const result = await db.insert(changes)
      .values({
        ...insertChange,
        changeNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateChange(id: number, changeUpdate: Partial<Change>): Promise<Change | undefined> {
    const results = await db.update(changes)
      .set({
        ...changeUpdate,
        updatedAt: new Date()
      })
      .where(eq(changes.id, id))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async getChangesByStatus(status: string): Promise<Change[]> {
    return await db.select().from(changes).where(eq(changes.status, status));
  }

  async getChangesByType(type: string): Promise<Change[]> {
    return await db.select().from(changes).where(eq(changes.type, type));
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
