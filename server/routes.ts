import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { activeDirectoryService } from "./services/active-directory";
import { 
  insertTicketSchema, 
  insertKnowledgeArticleSchema,
  insertServiceItemSchema,
  insertTicketCommentSchema,
  insertSlaDefinitionSchema,
  insertBusinessHoursSchema,
  insertAssetSchema,
  insertProblemSchema,
  insertChangeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints - all prefixed with /api

  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  // Ticket routes
  const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: Function) => {
      const userRole = req.user?.role || 'user';
      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({ message: "Unauthorized access" });
      }
    };
  };

  app.get("/api/tickets", checkRole(['user', 'technician', 'manager', 'admin']), async (req: Request, res: Response) => {
    try {
      let tickets = await storage.getTickets();

      // Filter tickets for regular users to see only their own
      if (req.user?.role === 'user') {
        tickets = tickets.filter(ticket => ticket.requesterId === req.user.id);
      }

      // Apply filters if provided
      const { status, priority, assigneeId } = req.query;

      if (status && typeof status === "string") {
        tickets = tickets.filter(ticket => ticket.status === status);
      }

      if (priority && typeof priority === "string") {
        tickets = tickets.filter(ticket => ticket.priority === priority);
      }

      if (assigneeId && typeof assigneeId === "string") {
        const id = parseInt(assigneeId);
        if (!isNaN(id)) {
          tickets = tickets.filter(ticket => ticket.assigneeId === id);
        }
      }

      // Sort tickets if sort parameter is provided
      const { sort } = req.query;
      if (sort === "created") {
        tickets.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "updated") {
        tickets.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "priority") {
        const priorityOrder = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
        tickets.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
      }

      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tickets" });
    }
  });

  app.get("/api/tickets/:id", checkRole(['technician', 'manager', 'admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve ticket" });
    }
  });

  app.post("/api/tickets", checkRole(['user']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ticket data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", checkRole(['technician', 'manager', 'admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const updatedTicket = await storage.updateTicket(id, req.body);
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Ticket comments
  app.get("/api/tickets/:ticketId/comments", checkRole(['user', 'technician', 'manager', 'admin']), async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const comments = await storage.getTicketComments(ticketId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve comments" });
    }
  });

  app.post("/api/tickets/:ticketId/comments", checkRole(['user', 'technician']), async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const ticket = await storage.getTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const data = { ...req.body, ticketId };
      const validatedData = insertTicketCommentSchema.parse(data);
      const comment = await storage.createTicketComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Knowledge base routes
  app.get("/api/knowledge", async (req: Request, res: Response) => {
    try {
      const articles = await storage.getKnowledgeArticles();

      // Filter by category if provided
      const { category } = req.query;
      let filteredArticles = articles;

      if (category && typeof category === "string") {
        filteredArticles = articles.filter(article => article.category === category);
      }

      // Only return published articles unless explicitly asked for unpublished
      const { showUnpublished } = req.query;
      if (!showUnpublished || showUnpublished !== "true") {
        filteredArticles = filteredArticles.filter(article => article.published);
      }

      res.json(filteredArticles);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve knowledge articles" });
    }
  });

  app.get("/api/knowledge/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeArticle(id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Increment view count
      await storage.incrementArticleViews(id);

      // Get updated article with incremented view count
      const updatedArticle = await storage.getKnowledgeArticle(id);
      res.json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve article" });
    }
  });

  app.post("/api/knowledge", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertKnowledgeArticleSchema.parse(req.body);
      const article = await storage.createKnowledgeArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/knowledge/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeArticle(id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const updatedArticle = await storage.updateKnowledgeArticle(id, req.body);
      res.json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Service catalog routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServiceItems();

      // Filter by category if provided
      const { category } = req.query;
      let filteredServices = services;

      if (category && typeof category === "string") {
        filteredServices = services.filter(service => service.category === category);
      }

      res.json(filteredServices);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve service items" });
    }
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceItem(id);

      if (!service) {
        return res.status(404).json({ message: "Service item not found" });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve service item" });
    }
  });

  app.post("/api/services", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertServiceItemSchema.parse(req.body);
      const service = await storage.createServiceItem(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service item" });
    }
  });

  app.patch("/api/services/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceItem(id);

      if (!service) {
        return res.status(404).json({ message: "Service item not found" });
      }

      const updatedService = await storage.updateServiceItem(id, req.body);
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service item" });
    }
  });

  // Stats for dashboard
  app.get("/api/stats", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const tickets = await storage.getTickets();
      const problems = await storage.getProblems();
      const changes = await storage.getChanges();
      const assets = await storage.getAssets();

      const openTickets = tickets.filter(ticket => ["open", "in_progress", "on_hold"].includes(ticket.status)).length;
      const criticalIncidents = tickets.filter(ticket => ticket.priority === "critical" && ticket.type === "incident").length;

      // Calculate SLA Compliance
      const resolvedTickets = tickets.filter(ticket => ticket.status === "resolved" || ticket.status === "closed");
      const slaCompliantTickets = resolvedTickets.filter(ticket => ticket.slaStatus === "completed" || ticket.slaStatus === "on_track");
      const slaCompliance = resolvedTickets.length > 0 
        ? Math.round((slaCompliantTickets.length / resolvedTickets.length) * 100) 
        : 100;

      // Calculate average resolution time (in hours)
      const ticketsWithTimeSpent = resolvedTickets.filter(ticket => ticket.timeSpent !== null && ticket.timeSpent !== undefined);
      const totalTimeSpent = ticketsWithTimeSpent.reduce((sum, ticket) => sum + (ticket.timeSpent || 0), 0);
      const avgResolutionTime = ticketsWithTimeSpent.length > 0 
        ? (totalTimeSpent / ticketsWithTimeSpent.length) / 60 
        : 0;

      // Add more stats for new features
      const openProblems = problems.filter(problem => ["open", "in_progress", "under_review"].includes(problem.status)).length;
      const pendingChanges = changes.filter(change => ["pending_approval", "scheduled", "in_progress"].includes(change.status)).length;
      const assetsNeedingMaintenance = assets.filter(asset => ["maintenance_required", "repair_needed"].includes(asset.status)).length;

      // New metrics for dashboard
      const assetsCount = assets.length;
      const hardwareIssues = tickets.filter(ticket => 
        ticket.category === "hardware" && 
        ["open", "in_progress", "on_hold"].includes(ticket.status)
      ).length;

      res.json({
        openTickets,
        criticalIncidents,
        slaCompliance,
        avgResolutionTime,
        openProblems,
        pendingChanges,
        assetsCount,
        hardwareIssues
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve stats" });
    }
  });

  // SLA Management routes
  app.get("/api/slas", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const slas = await storage.getSlaDefinitions();
      res.json(slas);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve SLA definitions" });
    }
  });

  app.get("/api/slas/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sla = await storage.getSlaDefinition(id);

      if (!sla) {
        return res.status(404).json({ message: "SLA definition not found" });
      }

      res.json(sla);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve SLA definition" });
    }
  });

  app.post("/api/slas", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertSlaDefinitionSchema.parse(req.body);
      const sla = await storage.createSlaDefinition(validatedData);
      res.status(201).json(sla);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid SLA definition data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create SLA definition" });
    }
  });

  app.patch("/api/slas/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sla = await storage.getSlaDefinition(id);

      if (!sla) {
        return res.status(404).json({ message: "SLA definition not found" });
      }

      const updatedSla = await storage.updateSlaDefinition(id, req.body);
      res.json(updatedSla);
    } catch (error) {
      res.status(500).json({ message: "Failed to update SLA definition" });
    }
  });

  // Business Hours routes
  app.get("/api/business-hours", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const businessHours = await storage.getBusinessHours();
      res.json(businessHours);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve business hours" });
    }
  });

  app.post("/api/business-hours", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusinessHoursSchema.parse(req.body);
      const businessHour = await storage.createBusinessHour(validatedData);
      res.status(201).json(businessHour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business hour data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business hour" });
    }
  });

  app.patch("/api/business-hours/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const businessHour = await storage.updateBusinessHour(id, req.body);

      if (!businessHour) {
        return res.status(404).json({ message: "Business hour not found" });
      }

      res.json(businessHour);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business hour" });
    }
  });

  // Asset Management routes
  app.get("/api/assets", checkRole(['admin', 'technician']), async (req: Request, res: Response) => {
    try {
      let assets = await storage.getAssets();

      // Apply filters if provided
      const { status, type, assignedToId } = req.query;

      if (status && typeof status === "string") {
        assets = assets.filter(asset => asset.status === status);
      }

      if (type && typeof type === "string") {
        assets = assets.filter(asset => asset.type === type);
      }

      if (assignedToId && typeof assignedToId === "string") {
        const id = parseInt(assignedToId);
        if (!isNaN(id)) {
          assets = assets.filter(asset => asset.assignedToId === id);
        }
      }

      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve assets" });
    }
  });

  app.get("/api/assets/:id", checkRole(['admin', 'technician']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve asset" });
    }
  });

  app.get("/api/assets/tag/:assetTag", checkRole(['admin', 'technician']), async (req: Request, res: Response) => {
    try {
      const assetTag = req.params.assetTag;
      const asset = await storage.getAssetByTag(assetTag);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve asset" });
    }
  });

  app.post("/api/assets", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.patch("/api/assets/:id", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      const updatedAsset = await storage.updateAsset(id, req.body);
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  // Problem Management routes
  app.get("/api/problems", checkRole(['admin', 'manager', 'technician']), async (req: Request, res: Response) => {
    try {
      let problems = await storage.getProblems();

      // Apply filters if provided
      const { status, priority } = req.query;

      if (status && typeof status === "string") {
        problems = problems.filter(problem => problem.status === status);
      }

      if (priority && typeof priority === "string") {
        problems = problems.filter(problem => problem.priority === priority);
      }

      // Sort problems if sort parameter is provided
      const { sort } = req.query;
      if (sort === "created") {
        problems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "updated") {
        problems.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "priority") {
        const priorityOrder = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
        problems.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
      }

      res.json(problems);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve problems" });
    }
  });

  app.get("/api/problems/:id", checkRole(['admin', 'manager', 'technician']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const problem = await storage.getProblem(id);

      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      res.json(problem);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve problem" });
    }
  });

  app.post("/api/problems", checkRole(['admin', 'manager', 'technician']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertProblemSchema.parse(req.body);
      const problem = await storage.createProblem(validatedData);
      res.status(201).json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid problem data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  app.patch("/api/problems/:id", checkRole(['admin', 'manager', 'technician']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const problem = await storage.getProblem(id);

      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      const updatedProblem = await storage.updateProblem(id, req.body);
      res.json(updatedProblem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update problem" });
    }
  });

  // Change Management routes
  app.get("/api/changes", checkRole(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
      let changes = await storage.getChanges();

      // Apply filters if provided
      const { status, type } = req.query;

      if (status && typeof status === "string") {
        changes = changes.filter(change => change.status === status);
      }

      if (type && typeof type === "string") {
        changes = changes.filter(change => change.type === type);
      }

      // Sort changes if sort parameter is provided
      const { sort } = req.query;
      if (sort === "created") {
        changes.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "updated") {
        changes.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sort === "scheduled") {
        changes.sort((a, b) => {
          const dateA = a.scheduledStartTime ? new Date(a.scheduledStartTime).getTime() : 0;
          const dateB = b.scheduledStartTime ? new Date(b.scheduledStartTime).getTime() : 0;
          return dateA - dateB;  // Sort by scheduled date, earlier first
        });
      }

      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve changes" });
    }
  });

  app.get("/api/changes/:id", checkRole(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const change = await storage.getChange(id);

      if (!change) {
        return res.status(404).json({ message: "Change not found" });
      }

      res.json(change);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve change" });
    }
  });

  app.post("/api/changes", checkRole(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
      const validatedData = insertChangeSchema.parse(req.body);
      const change = await storage.createChange(validatedData);
      res.status(201).json(change);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid change data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create change" });
    }
  });

  app.patch("/api/changes/:id", checkRole(['admin', 'manager']), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const change = await storage.getChange(id);

      if (!change) {
        return res.status(404).json({ message: "Change not found" });
      }

      const updatedChange = await storage.updateChange(id, req.body);
      res.json(updatedChange);
    } catch (error) {
      res.status(500).json({ message: "Failed to update change" });
    }
  });

  // Active Directory Integration routes
  app.post("/api/settings/ad-config", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      // Validate request data
      const adConfigSchema = z.object({
        url: z.string().url(),
        baseDN: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        useTLS: z.boolean().default(true),
        useGraphAPI: z.boolean().default(false)
      });

      const validatedData = adConfigSchema.parse(req.body);

      // Configure the Active Directory service with the provided settings
      activeDirectoryService.configure({
        url: validatedData.url,
        baseDN: validatedData.baseDN,
        username: validatedData.username,
        password: validatedData.password,
        useTLS: validatedData.useTLS
      });

      // In a production environment, you would save these settings to a database
      // For this demo, we'll just acknowledge receipt
      res.json({ success: true, message: "Active Directory configuration updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid configuration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: "Failed to update Active Directory configuration" 
      });
    }
  });

  app.post("/api/settings/ad-test", checkRole(['admin']), async (req: Request, res: Response) => {
    try {
      // Validate request data with same schema
      const adConfigSchema = z.object({
        url: z.string().url(),
        baseDN: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        useTLS: z.boolean().default(true),
        useGraphAPI: z.boolean().default(false)
      });

      const validatedData = adConfigSchema.parse(req.body);

      // Temporarily configure the AD service for testing
      activeDirectoryService.configure({
        url: validatedData.url,
        baseDN: validatedData.baseDN,
        username: validatedData.username,
        password: validatedData.password,
        useTLS: validatedData.useTLS
      });

      // Test the connection by attempting to authenticate with the service account
      const isValid = await activeDirectoryService.validateUser(
        validatedData.username, 
        validatedData.password
      );

      if (isValid) {
        res.json({ 
          success: true, 
          message: "Successfully connected to Active Directory" 
        });
      } else {
        res.json({ 
          success: false, 
          message: "Failed to authenticate with Active Directory. Please check your credentials." 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid configuration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false, message: "An error occurred while testing the connection" 
      });
    }
  });

  // User validation against Active Directory
  app.post("/api/validate-user", async (req: Request, res: Response) => {
    try {
      console.log("Login attempt:", { username: req.body.username });
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
      }

      // For demo purposes - allow admin/admin123
      if (username === 'admin' && password === 'admin123') {
        return res.json({
          success: true,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin',
            name: 'Administrator'
          }
        });
      }

      // Check if AD is configured
      if (!activeDirectoryService.isActive()) {
        return res.json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }

      // Attempt to validate the user
      const isValid = await activeDirectoryService.validateUser(username, password);

      if (isValid) {
        // Get user information from AD
        const adUser = await activeDirectoryService.findUser(username);

        res.json({ 
          success: true, 
          message: "User authenticated successfully", 
          user: adUser 
        });
      } else {
        res.json({ 
          success: false, 
          message: "Authentication failed. Invalid username or password." 
        });
      }
    } catch (error) {
      console.error("Error validating user:", error);
      res.status(500).json({ 
        success: false, 
        message: "An error occurred during authentication" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}