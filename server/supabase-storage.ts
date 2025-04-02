import { supabase } from './supabase';
import { type IStorage } from './storage';
import {
  type User, type InsertUser,
  type Ticket, type InsertTicket,
  type KnowledgeArticle, type InsertKnowledgeArticle,
  type ServiceItem, type InsertServiceItem,
  type TicketComment, type InsertTicketComment
} from '@shared/schema';

export class SupabaseStorage implements IStorage {
  private ticketCounter: number = 1000;

  constructor() {
    // Initialize ticket counter on startup
    this.initTicketCounter();
  }

  private async initTicketCounter() {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('ticketNumber')
        .order('ticketNumber', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastTicketNumber = data[0].ticketNumber;
        const numericPart = parseInt(lastTicketNumber.replace('T-', ''), 10);
        this.ticketCounter = numericPart || 1000;
      }
    } catch (error) {
      console.error('Error initializing ticket counter:', error);
      // Default to 1000 if error
      this.ticketCounter = 1000;
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data as User[];
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const createdAt = new Date().toISOString();
    const userData = { ...user, createdAt };
    
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as User;
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    const { data, error } = await supabase.from('tickets').select('*');
    if (error) throw error;
    return data as Ticket[];
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as Ticket;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticketNumber', ticketNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as Ticket;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    this.ticketCounter++;
    const ticketNumber = `T-${this.ticketCounter}`;
    const now = new Date().toISOString();
    
    const ticketData = {
      ...ticket,
      ticketNumber,
      createdAt: now,
      updatedAt: now
    };
    
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as Ticket;
  }

  async updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined> {
    const updatedAt = new Date().toISOString();
    const ticketData = { ...ticket, updatedAt };
    
    const { data, error } = await supabase
      .from('tickets')
      .update(ticketData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as Ticket;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', status);
    
    if (error) throw error;
    
    return data as Ticket[];
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('priority', priority);
    
    if (error) throw error;
    
    return data as Ticket[];
  }

  async getTicketsByAssignee(assigneeId: number): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('assigneeId', assigneeId);
    
    if (error) throw error;
    
    return data as Ticket[];
  }

  async getTicketsByRequester(requesterId: number): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('requesterId', requesterId);
    
    if (error) throw error;
    
    return data as Ticket[];
  }

  // Knowledge article operations
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    const { data, error } = await supabase.from('knowledge_articles').select('*');
    if (error) throw error;
    return data as KnowledgeArticle[];
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as KnowledgeArticle;
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const now = new Date().toISOString();
    
    const articleData = {
      ...article,
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    
    const { data, error } = await supabase
      .from('knowledge_articles')
      .insert(articleData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as KnowledgeArticle;
  }

  async updateKnowledgeArticle(id: number, article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const updatedAt = new Date().toISOString();
    const articleData = { ...article, updatedAt };
    
    const { data, error } = await supabase
      .from('knowledge_articles')
      .update(articleData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as KnowledgeArticle;
  }

  async incrementArticleViews(id: number): Promise<KnowledgeArticle | undefined> {
    // First get the current article to check views
    const article = await this.getKnowledgeArticle(id);
    if (!article) return undefined;
    
    const updatedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({ 
        views: (article.views || 0) + 1,
        updatedAt
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as KnowledgeArticle;
  }

  // Service catalog operations
  async getServiceItems(): Promise<ServiceItem[]> {
    const { data, error } = await supabase.from('service_items').select('*');
    if (error) throw error;
    return data as ServiceItem[];
  }

  async getServiceItem(id: number): Promise<ServiceItem | undefined> {
    const { data, error } = await supabase
      .from('service_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as ServiceItem;
  }

  async createServiceItem(item: InsertServiceItem): Promise<ServiceItem> {
    const now = new Date().toISOString();
    
    const itemData = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const { data, error } = await supabase
      .from('service_items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as ServiceItem;
  }

  async updateServiceItem(id: number, item: Partial<ServiceItem>): Promise<ServiceItem | undefined> {
    const updatedAt = new Date().toISOString();
    const itemData = { ...item, updatedAt };
    
    const { data, error } = await supabase
      .from('service_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Record not found
      throw error;
    }
    
    return data as ServiceItem;
  }

  // Comment operations
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticketId', ticketId);
    
    if (error) throw error;
    
    return data as TicketComment[];
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const createdAt = new Date().toISOString();
    const commentData = { ...comment, createdAt };
    
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert(commentData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as TicketComment;
  }
}

export const supabaseStorage = new SupabaseStorage();