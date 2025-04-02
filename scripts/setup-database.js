// This script checks if tables exist and seeds data using REST API
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const supabaseUrl = 'https://uerwznjvuacgmvojqnup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcnd6bmp2dWFjZ212b2pxbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDM3ODIsImV4cCI6MjA1OTA3OTc4Mn0.S2sUU9rskiaCA9y_CwcIZL9UO20jMPjEgssspYPgqfk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesExist() {
  console.log('Checking if tables exist...');
  
  try {
    // Check if the users table exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (userError && userError.code === 'PGRST104') {
      // Table doesn't exist, display instructions
      console.log('Tables do not exist. Please create tables in the Supabase SQL Editor using the following SQL:');
      const createTablesSQL = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');
      console.log(createTablesSQL);
      return false;
    }
    
    // Tables exist or there was a different error
    if (userError) {
      console.error('Error checking tables:', userError);
      return false;
    }
    
    console.log('Tables exist, continuing with data seeding');
    return true;
    
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

async function seedUsers() {
  console.log('Seeding users...');
  
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      full_name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      username: 'technician1',
      password: 'tech123',
      full_name: 'James Wilson',
      email: 'james@example.com',
      role: 'technician',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      username: 'technician2',
      password: 'tech123',
      full_name: 'Sarah Parker',
      email: 'sarah@example.com',
      role: 'technician',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      username: 'user1',
      password: 'user123',
      full_name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'user',
      avatar_url: null
    },
    {
      username: 'user2',
      password: 'user123',
      full_name: 'Maria Garcia',
      email: 'maria@example.com',
      role: 'user',
      avatar_url: null
    }
  ];
  
  for (const user of users) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', user.username)
      .single();
      
    if (existingUser) {
      console.log(`User ${user.username} already exists, skipping`);
      continue;
    }
    
    // Insert user
    const { error } = await supabase
      .from('users')
      .insert(user);
      
    if (error) {
      console.error(`Error inserting user ${user.username}:`, error);
    } else {
      console.log(`User ${user.username} inserted successfully`);
    }
  }
  
  return true;
}

async function seedTickets() {
  console.log('Seeding tickets...');
  
  // Get user IDs
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, username');
    
  if (userError) {
    console.error('Error fetching users:', userError);
    return false;
  }
  
  const userMap = {};
  users.forEach(user => {
    userMap[user.username] = user.id;
  });
  
  // Check if we have necessary users for tickets
  if (!userMap['user1'] || !userMap['technician1'] || !userMap['user2'] || !userMap['technician2']) {
    console.error('Missing required users for tickets');
    return false;
  }
  
  const tickets = [
    {
      ticket_number: 'T-1001',
      subject: 'Unable to access network drive',
      description: 'I can\'t access the shared network drive. Getting error message: "Access denied".',
      status: 'in_progress',
      priority: 'high',
      type: 'incident',
      category: 'network',
      requester_id: userMap['user1'],
      assignee_id: userMap['technician1'], 
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      time_spent: 0,
      sla_status: 'on_track'
    },
    {
      ticket_number: 'T-1002',
      subject: 'Email service down for marketing department',
      description: 'The entire marketing team can\'t send or receive emails since 9 AM today.',
      status: 'open',
      priority: 'critical',
      type: 'incident',
      category: 'email',
      requester_id: userMap['user2'],
      assignee_id: userMap['technician2'],
      due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      time_spent: 0,
      sla_status: 'at_risk'
    }
  ];
  
  for (const ticket of tickets) {
    // Check if ticket already exists
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('ticket_number', ticket.ticket_number)
      .single();
      
    if (existingTicket) {
      console.log(`Ticket ${ticket.ticket_number} already exists, skipping`);
      continue;
    }
    
    // Insert ticket
    const { error } = await supabase
      .from('tickets')
      .insert(ticket);
      
    if (error) {
      console.error(`Error inserting ticket ${ticket.ticket_number}:`, error);
    } else {
      console.log(`Ticket ${ticket.ticket_number} inserted successfully`);
    }
  }
  
  return true;
}

async function seedKnowledgeArticles() {
  console.log('Seeding knowledge articles...');
  
  // Get user IDs
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, username');
    
  if (userError) {
    console.error('Error fetching users:', userError);
    return false;
  }
  
  const userMap = {};
  users.forEach(user => {
    userMap[user.username] = user.id;
  });
  
  // Check if we have necessary users for articles
  if (!userMap['technician1'] || !userMap['technician2']) {
    console.error('Missing required users for knowledge articles');
    return false;
  }
  
  const articles = [
    {
      title: 'VPN Connection Troubleshooting',
      content: 'Learn how to diagnose and resolve common VPN connection issues, including timeout errors, authentication problems, and split tunneling configuration.',
      category: 'network',
      author_id: userMap['technician1'],
      views: 15,
      published: true,
      tags: ['vpn', 'network', 'remote access', 'troubleshooting']
    },
    {
      title: 'Office 365 Email Setup Guide',
      content: 'Step-by-step guide for setting up Office 365 email accounts on various devices and email clients, including troubleshooting common configuration issues.',
      category: 'software',
      author_id: userMap['technician2'],
      views: 24,
      published: true,
      tags: ['office 365', 'email', 'configuration', 'setup']
    }
  ];
  
  for (const article of articles) {
    // Check if article already exists
    const { data: existingArticle } = await supabase
      .from('knowledge_articles')
      .select('id')
      .eq('title', article.title)
      .single();
      
    if (existingArticle) {
      console.log(`Article "${article.title}" already exists, skipping`);
      continue;
    }
    
    // Insert article
    const { error } = await supabase
      .from('knowledge_articles')
      .insert(article);
      
    if (error) {
      console.error(`Error inserting article "${article.title}":`, error);
    } else {
      console.log(`Article "${article.title}" inserted successfully`);
    }
  }
  
  return true;
}

async function seedServiceItems() {
  console.log('Seeding service items...');
  
  const serviceItems = [
    {
      name: 'New Employee Setup',
      description: 'Complete IT setup for new employees, including computer, accounts, and software installation.',
      category: 'onboarding',
      estimated_time: '1-2 business days',
      approval_required: false,
      form_data: {
        fields: [
          { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
          { name: 'start_date', label: 'Start Date', type: 'date', required: true },
          { name: 'department', label: 'Department', type: 'select', options: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'], required: true },
          { name: 'manager', label: 'Manager', type: 'text', required: true },
          { name: 'special_requirements', label: 'Special Requirements', type: 'textarea', required: false }
        ]
      }
    },
    {
      name: 'Software Installation Request',
      description: 'Request installation of software on company device. All software must be approved per company policy.',
      category: 'software',
      estimated_time: '4-8 hours',
      approval_required: true,
      form_data: {
        fields: [
          { name: 'software_name', label: 'Software Name', type: 'text', required: true },
          { name: 'business_justification', label: 'Business Justification', type: 'textarea', required: true },
          { name: 'urgency', label: 'Urgency', type: 'select', options: ['Low', 'Medium', 'High'], required: true }
        ]
      }
    }
  ];
  
  for (const item of serviceItems) {
    // Check if service item already exists
    const { data: existingItem } = await supabase
      .from('service_items')
      .select('id')
      .eq('name', item.name)
      .single();
      
    if (existingItem) {
      console.log(`Service item "${item.name}" already exists, skipping`);
      continue;
    }
    
    // Insert service item
    const { error } = await supabase
      .from('service_items')
      .insert(item);
      
    if (error) {
      console.error(`Error inserting service item "${item.name}":`, error);
    } else {
      console.log(`Service item "${item.name}" inserted successfully`);
    }
  }
  
  return true;
}

async function setupDatabase() {
  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return;
    }
    
    // Seed data
    await seedUsers();
    await seedTickets();
    await seedKnowledgeArticles();
    await seedServiceItems();
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup
setupDatabase();