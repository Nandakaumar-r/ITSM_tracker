-- Seed data for Supabase database

-- Sample users
INSERT INTO users (username, password, full_name, email, role, avatar_url, created_at)
VALUES 
  ('admin', 'admin123', 'Admin User', 'admin@example.com', 'admin', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', NOW()),
  ('technician1', 'tech123', 'James Wilson', 'james@example.com', 'technician', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', NOW()),
  ('technician2', 'tech123', 'Sarah Parker', 'sarah@example.com', 'technician', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', NOW()),
  ('technician3', 'tech123', 'Michael Brown', 'michael@example.com', 'technician', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', NOW()),
  ('user1', 'user123', 'Alex Johnson', 'alex@example.com', 'user', NULL, NOW()),
  ('user2', 'user123', 'Maria Garcia', 'maria@example.com', 'user', NULL, NOW()),
  ('user3', 'user123', 'Robert Lee', 'robert@example.com', 'user', NULL, NOW()),
  ('user4', 'user123', 'Jennifer Kim', 'jennifer@example.com', 'user', NULL, NOW()),
  ('user5', 'user123', 'David Wong', 'david@example.com', 'user', NULL, NOW())
ON CONFLICT (username) DO NOTHING;

-- Sample tickets
INSERT INTO tickets (ticket_number, subject, description, status, priority, type, category, requester_id, assignee_id, due_date, time_spent, sla_status, created_at, updated_at)
VALUES
  ('T-1001', 'Unable to access network drive', 'I can''t access the shared network drive. Getting error message: ''Access denied''.', 'in_progress', 'high', 'incident', 'network', 5, 2, NOW() + INTERVAL '24 hours', 0, 'on_track', NOW(), NOW()),
  ('T-1002', 'Email service down for marketing department', 'The entire marketing team can''t send or receive emails since 9 AM today.', 'open', 'critical', 'incident', 'email', 6, 3, NOW() + INTERVAL '4 hours', 0, 'at_risk', NOW(), NOW()),
  ('T-1003', 'Printer not functioning in Finance department', 'The main printer in the finance department is showing error code E-723.', 'resolved', 'medium', 'incident', 'hardware', 7, 4, NOW() + INTERVAL '48 hours', 120, 'completed', NOW(), NOW()),
  ('T-1004', 'VPN connection issue for remote workers', 'Remote employees are reporting intermittent VPN disconnections.', 'open', 'high', 'incident', 'network', 8, NULL, NOW() + INTERVAL '24 hours', 0, 'on_track', NOW(), NOW()),
  ('T-1005', 'Software license expired for design team', 'Adobe Creative Cloud licenses expired for the design team, affecting 12 users.', 'on_hold', 'medium', 'service_request', 'software', 9, 2, NOW() + INTERVAL '72 hours', 30, 'on_hold', NOW(), NOW())
ON CONFLICT (ticket_number) DO NOTHING;

-- Sample knowledge articles
INSERT INTO knowledge_articles (title, content, category, author_id, views, published, tags, created_at, updated_at)
VALUES
  ('VPN Connection Troubleshooting', 'Learn how to diagnose and resolve common VPN connection issues, including timeout errors, authentication problems, and split tunneling configuration.', 'network', 2, 15, TRUE, ARRAY['vpn', 'network', 'remote access', 'troubleshooting'], NOW(), NOW()),
  ('Office 365 Email Setup Guide', 'Step-by-step guide for setting up Office 365 email accounts on various devices and email clients, including troubleshooting common configuration issues.', 'software', 3, 24, TRUE, ARRAY['office 365', 'email', 'configuration', 'setup'], NOW(), NOW()),
  ('Printer Connectivity Solutions', 'Comprehensive guide to resolving common printer connectivity issues, including network printer setup, driver installation, and hardware troubleshooting.', 'hardware', 4, 8, TRUE, ARRAY['printer', 'hardware', 'network', 'drivers'], NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample service items
INSERT INTO service_items (name, description, category, estimated_time, approval_required, form_data, created_at, updated_at)
VALUES
  ('New Employee Setup', 'Setup of equipment, accounts, and access for new employees.', 'onboarding', '1-2 business days', TRUE, 
   '{"fields": [{"name": "employeeName", "label": "Employee Name", "type": "text", "required": true}, {"name": "startDate", "label": "Start Date", "type": "date", "required": true}, {"name": "department", "label": "Department", "type": "select", "options": ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"], "required": true}, {"name": "manager", "label": "Manager", "type": "text", "required": true}, {"name": "requiredEquipment", "label": "Required Equipment", "type": "checkbox", "options": ["Laptop", "Desktop", "Phone", "Monitor", "Headset"], "required": true}]}', 
   NOW(), NOW()),
  ('Software Installation Request', 'Request installation of software on company devices.', 'software', '1 business day', TRUE, 
   '{"fields": [{"name": "softwareName", "label": "Software Name", "type": "text", "required": true}, {"name": "businessJustification", "label": "Business Justification", "type": "textarea", "required": true}, {"name": "urgency", "label": "Urgency", "type": "select", "options": ["Low", "Medium", "High"], "required": true}]}', 
   NOW(), NOW()),
  ('Password Reset', 'Reset password for company accounts.', 'access', '1-4 hours', FALSE, 
   '{"fields": [{"name": "accountType", "label": "Account Type", "type": "select", "options": ["Email", "VPN", "Internal System", "Other"], "required": true}, {"name": "username", "label": "Username", "type": "text", "required": true}, {"name": "otherInformation", "label": "Additional Information", "type": "textarea", "required": false}]}', 
   NOW(), NOW()),
  ('VPN Access Request', 'Request access to company VPN for remote work.', 'access', '1 business day', TRUE, 
   '{"fields": [{"name": "purpose", "label": "Purpose", "type": "textarea", "required": true}, {"name": "duration", "label": "Access Duration", "type": "select", "options": ["Temporary (1 week)", "Temporary (1 month)", "Permanent"], "required": true}, {"name": "deviceType", "label": "Device Type", "type": "select", "options": ["Company Device", "Personal Device"], "required": true}]}', 
   NOW(), NOW())
ON CONFLICT DO NOTHING;