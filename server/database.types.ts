import { type User, type Ticket, type KnowledgeArticle, type ServiceItem, type TicketComment } from '@shared/schema';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>;
        Update: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>>;
      };
      knowledge_articles: {
        Row: KnowledgeArticle;
        Insert: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>;
        Update: Partial<Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      service_items: {
        Row: ServiceItem;
        Insert: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      ticket_comments: {
        Row: TicketComment;
        Insert: Omit<TicketComment, 'id' | 'createdAt'>;
        Update: Partial<Omit<TicketComment, 'id' | 'createdAt'>>;
      };
    };
  };
};