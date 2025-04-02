import { db } from "../server/db";
import { users, tickets, knowledgeArticles, serviceItems, ticketComments } from "../shared/schema";
import type { InsertUser, InsertTicket, InsertKnowledgeArticle, InsertServiceItem, InsertTicketComment } from "../shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // First check if we already have data
    const existingUsers = await db.select({ count: { value: users.id } }).from(users);
    
    if (existingUsers.length > 0 && existingUsers[0].count.value > 0) {
      console.log("Database already has data. Skipping seeding.");
      return;
    }

    console.log("Seeding users...");
    await seedUsers();
    
    console.log("Seeding tickets...");
    await seedTickets();
    
    console.log("Seeding knowledge articles...");
    await seedKnowledgeArticles();
    
    console.log("Seeding service catalog items...");
    await seedServiceItems();
    
    console.log("Seeding ticket comments...");
    await seedTicketComments();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function seedUsers() {
  const usersData: InsertUser[] = [
    {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
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
      username: "technician4",
      password: "tech123",
      fullName: "Emma Rodriguez",
      email: "emma@example.com",
      role: "technician",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
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
    },
    {
      username: "manager1",
      password: "manager123",
      fullName: "Patricia Miller",
      email: "patricia@example.com",
      role: "manager",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      username: "manager2",
      password: "manager123",
      fullName: "John Davis",
      email: "john@example.com",
      role: "manager",
      avatarUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    }
  ];

  for (const userData of usersData) {
    await db.insert(users).values(userData);
  }
}

async function seedTickets() {
  // Get user IDs for reference
  const usersList = await db.select().from(users);
  const userMap = new Map();
  usersList.forEach(user => {
    userMap.set(user.username, user.id);
  });

  const ticketsData: InsertTicket[] = [
    {
      subject: "Unable to access network drive",
      description: "I can't access the shared network drive. Getting error message: 'Access denied'.",
      status: "in_progress",
      priority: "high",
      type: "incident",
      category: "network",
      requesterId: userMap.get("user1"),
      assigneeId: userMap.get("technician1"),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      timeSpent: 45,
      slaStatus: "on_track"
    },
    {
      subject: "Email service down for marketing department",
      description: "The entire marketing team can't send or receive emails since 9 AM today.",
      status: "open",
      priority: "critical",
      type: "incident",
      category: "email",
      requesterId: userMap.get("user2"),
      assigneeId: userMap.get("technician2"),
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
      requesterId: userMap.get("user3"),
      assigneeId: userMap.get("technician3"),
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
      requesterId: userMap.get("user4"),
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
      requesterId: userMap.get("user5"),
      assigneeId: userMap.get("technician1"),
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      timeSpent: 30, // 30 minutes
      slaStatus: "on_hold"
    },
    {
      subject: "New laptop setup for marketing director",
      description: "Need to setup new MacBook Pro for incoming Marketing Director starting next Monday.",
      status: "open",
      priority: "medium",
      type: "service_request",
      category: "hardware",
      requesterId: userMap.get("manager1"),
      assigneeId: userMap.get("technician4"),
      dueDate: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days from now
      timeSpent: 0,
      slaStatus: "on_track"
    },
    {
      subject: "Microsoft Teams audio not working",
      description: "Can't hear audio during Teams meetings, but video works fine. Tested with multiple headsets.",
      status: "in_progress",
      priority: "high",
      type: "incident",
      category: "software",
      requesterId: userMap.get("user1"),
      assigneeId: userMap.get("technician2"),
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      timeSpent: 25,
      slaStatus: "on_track"
    },
    {
      subject: "Unable to access CRM system",
      description: "Getting 'Access Denied' when trying to login to the CRM system. Credentials were working yesterday.",
      status: "open",
      priority: "high",
      type: "incident",
      category: "application",
      requesterId: userMap.get("user3"),
      assigneeId: null,
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      timeSpent: 0,
      slaStatus: "on_track"
    },
    {
      subject: "Request for dual monitors",
      description: "Requesting additional monitor for productivity improvement.",
      status: "pending_approval",
      priority: "low",
      type: "service_request",
      category: "hardware",
      requesterId: userMap.get("user2"),
      assigneeId: userMap.get("technician1"),
      dueDate: new Date(Date.now() + 120 * 60 * 60 * 1000), // 5 days from now
      timeSpent: 15,
      slaStatus: "on_track"
    },
    {
      subject: "Weekly data backup failure",
      description: "The weekly backup job failed last night with error code BKP-420. Needs immediate attention.",
      status: "open",
      priority: "critical",
      type: "incident",
      category: "infrastructure",
      requesterId: userMap.get("manager2"),
      assigneeId: userMap.get("technician3"),
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      timeSpent: 0,
      slaStatus: "at_risk"
    },
    {
      subject: "WiFi slow in conference rooms",
      description: "WiFi speeds are extremely slow in the main conference rooms during meetings.",
      status: "in_progress",
      priority: "medium",
      type: "incident",
      category: "network",
      requesterId: userMap.get("user5"),
      assigneeId: userMap.get("technician4"),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      timeSpent: 60, // 1 hour
      slaStatus: "on_track"
    },
    {
      subject: "Need access to financial reporting system",
      description: "Require access to the financial reporting system for quarterly audit purposes.",
      status: "pending_approval",
      priority: "medium",
      type: "service_request",
      category: "access",
      requesterId: userMap.get("user4"),
      assigneeId: userMap.get("technician2"),
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      timeSpent: 10,
      slaStatus: "on_track"
    }
  ];

  let ticketCounter = 1001;
  for (const ticketData of ticketsData) {
    await db.insert(tickets).values({
      ...ticketData,
      ticketNumber: `T-${ticketCounter++}`,
    });
  }
}

async function seedKnowledgeArticles() {
  // Get user IDs for reference
  const usersList = await db.select().from(users);
  const userMap = new Map();
  usersList.forEach(user => {
    userMap.set(user.username, user.id);
  });

  const articlesData: InsertKnowledgeArticle[] = [
    {
      title: "VPN Connection Troubleshooting",
      content: `# VPN Connection Troubleshooting Guide

## Common Issues

### Connection Timeout
If you're experiencing connection timeouts:
1. Check your internet connection
2. Verify the VPN server address is correct
3. Try connecting to a different VPN server
4. Restart your VPN client

### Authentication Failures
If you're experiencing authentication issues:
1. Verify your username and password
2. Check if your account is locked (after too many failed attempts)
3. Ensure your account has VPN access permissions

### Split Tunneling Problems
If you're having issues with split tunneling:
1. Review your split tunneling configuration
2. Check if specific applications are configured correctly
3. Try disabling split tunneling temporarily to isolate the issue

## Contact Information
For further assistance, contact the IT Help Desk at helpdesk@example.com or ext. 1234.`,
      category: "network",
      authorId: userMap.get("technician1"),
      published: true,
      tags: ["vpn", "network", "remote access", "troubleshooting"]
    },
    {
      title: "Office 365 Email Setup Guide",
      content: `# Office 365 Email Setup Guide

## Setting Up Email on Desktop
### Outlook Desktop Client
1. Open Outlook
2. Go to File > Add Account
3. Enter your company email address
4. Follow the automatic setup instructions

### Mail App (macOS)
1. Open Mail
2. Go to Mail > Add Account
3. Select Exchange
4. Enter your email and password
5. Follow the prompts to complete setup

## Setting Up Email on Mobile Devices
### iOS
1. Go to Settings > Mail > Accounts
2. Tap Add Account > Microsoft Exchange
3. Enter your email and description
4. Tap Next and sign in with your Office 365 credentials

### Android
1. Open Gmail or Email app
2. Go to Settings > Add Account
3. Select Office365 or Exchange
4. Enter your email and password
5. Follow the setup instructions

## Troubleshooting
- If setup fails, verify your credentials
- Ensure you're connected to the internet
- Check with IT if your account has proper licenses

For assistance, contact the help desk at extension 5555.`,
      category: "software",
      authorId: userMap.get("technician2"),
      published: true,
      tags: ["office 365", "email", "configuration", "setup"]
    },
    {
      title: "Printer Connectivity Solutions",
      content: `# Printer Connectivity Troubleshooting

## Network Printer Setup
1. Ensure the printer is powered on and connected to the network
2. Verify the printer has a valid IP address
3. Check that your computer is on the same network as the printer
4. Add the printer using the IP address if automatic discovery fails

## Driver Installation
1. Download the latest drivers from the manufacturer's website
2. Uninstall any existing printer drivers before installing new ones
3. Follow the manufacturer's installation instructions
4. Restart your computer after installation

## Common Issues
- **Error 0x00000709**: Default printer cannot be set
  - Solution: Use the printer troubleshooter in Windows Settings
- **Print Spooler Errors**:
  - Restart the Print Spooler service
  - Clear the print queue
- **Offline Status**:
  - Check network connectivity
  - Restart the printer

## For Assistance
Contact the IT Support team at ext. 4321 or submit a ticket through the IT portal.`,
      category: "hardware",
      authorId: userMap.get("technician3"),
      published: true,
      tags: ["printer", "hardware", "network", "drivers"]
    },
    {
      title: "Laptop Battery Optimization Guide",
      content: `# Laptop Battery Optimization Guide

## Extending Battery Life
1. Adjust screen brightness to 50% or lower
2. Enable power saving mode when on battery
3. Close unused applications and browser tabs
4. Disable Bluetooth and Wi-Fi when not in use
5. Set shorter sleep timers

## Battery Health Maintenance
1. Avoid completely draining the battery
2. Don't leave your laptop plugged in constantly
3. Store laptops at 40-80% charge if unused for long periods
4. Keep your laptop cool - avoid using on soft surfaces that block vents

## Power Settings Configuration
### Windows
1. Go to Settings > System > Power & battery
2. Select "Best power efficiency" mode
3. Customize advanced power settings for optimal battery life

### macOS
1. Go to System Preferences > Battery
2. Enable "Optimize video streaming while on battery"
3. Turn on "Optimize battery charging"

## Battery Replacement
If your battery holds less than 80% of its original capacity, submit a request for battery replacement through the IT portal.`,
      category: "hardware",
      authorId: userMap.get("technician4"),
      published: true,
      tags: ["laptop", "battery", "power", "optimization"]
    },
    {
      title: "Corporate Password Policy Guidelines",
      content: `# Corporate Password Policy Guidelines

## Password Requirements
- Minimum length: 12 characters
- Must include at least one character from each category:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)
- Cannot contain your username or parts of your full name
- Cannot reuse your last 5 passwords

## Password Change Policy
- Standard accounts: Password change required every 90 days
- Privileged accounts: Password change required every 45 days
- You will receive email reminders 14, 7, and 3 days before expiration

## Multi-Factor Authentication (MFA)
- MFA is required for all systems accessible outside the corporate network
- Options for second factor:
  - Mobile app (Microsoft Authenticator or Google Authenticator)
  - SMS verification
  - Hardware token (available upon request)

## Security Best Practices
- Use a different password for each system or application
- Consider using a password manager
- Never share passwords with anyone, including IT staff
- Report any suspected security incidents immediately

For assistance, contact the Security team at security@example.com.`,
      category: "security",
      authorId: userMap.get("admin"),
      published: true,
      tags: ["security", "password", "policy", "mfa"]
    },
    {
      title: "Using the Company VPN Service",
      content: `# Using the Company VPN Service

## Installation
1. Download the VPN client from the company portal
2. Install following the on-screen instructions
3. Restart your computer after installation

## Connection Instructions
1. Launch the VPN client
2. Enter your company username (same as email)
3. Enter your network password
4. Select the appropriate server location
5. Click Connect

## When to Use VPN
- Always use VPN when working remotely on public WiFi
- Use VPN to access internal company resources like:
  - Shared drives
  - Intranet
  - Development environments
  - Internal applications

## Troubleshooting
- **Connection failures**: Verify your internet connection and credentials
- **Slow performance**: Try connecting to a different server location
- **Connection drops**: Check your internet stability and try reconnecting

## Support
For VPN issues, contact the Network team at network-support@example.com or ext. 3333.`,
      category: "network",
      authorId: userMap.get("technician1"),
      published: true,
      tags: ["vpn", "remote", "connectivity", "security"]
    },
    {
      title: "Microsoft Teams Best Practices",
      content: `# Microsoft Teams Best Practices

## Meeting Etiquette
1. Join meetings a few minutes early to test audio/video
2. Mute your microphone when not speaking
3. Use video when possible to improve engagement
4. Use the "raise hand" feature to indicate you want to speak
5. Close other applications to optimize performance

## Teams Organization
- Use channels for specific topics or projects
- Pin important channels for quick access
- Set up notifications properly to avoid distraction
- Archive inactive channels rather than deleting them

## File Sharing and Collaboration
- Use the Files tab in Teams for document collaboration
- Co-edit documents directly in Teams
- Use version history in SharePoint to track changes
- Share screen for presentations or demonstrations

## Teams Mobile App
- Install the mobile app for on-the-go communications
- Configure notification settings to avoid after-hours disruption
- Use the "quiet hours" feature to balance work-life boundaries

For Teams training, visit our Learning Portal or contact training@example.com.`,
      category: "software",
      authorId: userMap.get("technician2"),
      published: true,
      tags: ["teams", "communication", "collaboration", "meetings"]
    }
  ];

  for (const articleData of articlesData) {
    await db.insert(knowledgeArticles).values({
      ...articleData,
      views: Math.floor(Math.random() * 50) // Random view count between 0-49
    });
  }
}

async function seedServiceItems() {
  const serviceItemsData: InsertServiceItem[] = [
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
    },
    {
      name: "Equipment Repair",
      description: "Submit a request for repair of company-issued equipment.",
      category: "hardware",
      estimatedTime: "3-5 business days",
      approvalRequired: false,
      formData: {
        fields: [
          { name: "equipmentType", label: "Equipment Type", type: "select", options: ["Laptop", "Desktop", "Phone", "Printer", "Monitor", "Other"], required: true },
          { name: "assetTag", label: "Asset Tag Number", type: "text", required: true },
          { name: "issueDescription", label: "Issue Description", type: "textarea", required: true },
          { name: "urgency", label: "Urgency", type: "select", options: ["Low", "Medium", "High", "Critical"], required: true }
        ]
      }
    },
    {
      name: "Office Relocation Assistance",
      description: "Request IT assistance for office or desk relocation.",
      category: "facilities",
      estimatedTime: "1-2 business days",
      approvalRequired: true,
      formData: {
        fields: [
          { name: "currentLocation", label: "Current Location", type: "text", required: true },
          { name: "newLocation", label: "New Location", type: "text", required: true },
          { name: "moveDate", label: "Move Date", type: "date", required: true },
          { name: "equipmentList", label: "Equipment to be Moved", type: "textarea", required: true },
          { name: "specialRequirements", label: "Special Requirements", type: "textarea", required: false }
        ]
      }
    },
    {
      name: "Guest WiFi Access",
      description: "Request temporary WiFi access for visitors.",
      category: "network",
      estimatedTime: "1 business day",
      approvalRequired: true,
      formData: {
        fields: [
          { name: "visitorName", label: "Visitor Name(s)", type: "textarea", required: true },
          { name: "companyName", label: "Company Name", type: "text", required: true },
          { name: "visitPurpose", label: "Purpose of Visit", type: "textarea", required: true },
          { name: "accessStart", label: "Access Start Date", type: "date", required: true },
          { name: "accessEnd", label: "Access End Date", type: "date", required: true },
          { name: "hostEmployee", label: "Host Employee", type: "text", required: true }
        ]
      }
    },
    {
      name: "Mobile Device Provisioning",
      description: "Request a new company mobile device or enrollment of personal device in MDM.",
      category: "hardware",
      estimatedTime: "3-5 business days",
      approvalRequired: true,
      formData: {
        fields: [
          { name: "deviceType", label: "Device Type", type: "select", options: ["Smartphone", "Tablet", "Other"], required: true },
          { name: "deviceOwnership", label: "Device Ownership", type: "select", options: ["Company Provided", "Personal Device"], required: true },
          { name: "operatingSystem", label: "Operating System", type: "select", options: ["iOS", "Android"], required: true },
          { name: "businessJustification", label: "Business Justification", type: "textarea", required: true },
          { name: "managerApproval", label: "Manager Name for Approval", type: "text", required: true }
        ]
      }
    }
  ];

  for (const serviceItemData of serviceItemsData) {
    await db.insert(serviceItems).values(serviceItemData);
  }
}

async function seedTicketComments() {
  // Get data for reference
  const usersList = await db.select().from(users);
  const ticketsList = await db.select().from(tickets);
  
  const userMap = new Map();
  usersList.forEach(user => {
    userMap.set(user.username, user.id);
  });

  // Create comments for each ticket
  for (const ticket of ticketsList) {
    // 1-3 comments per ticket
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      let commentUser;
      let commentContent;
      
      // First comment is usually from the assignee
      if (i === 0 && ticket.assigneeId) {
        commentUser = ticket.assigneeId;
        commentContent = `I'm investigating this issue. Will update soon.`;
      } 
      // Sometimes a comment from the requester
      else if (i === 1) {
        commentUser = ticket.requesterId;
        commentContent = `Thanks for looking into this. Please let me know if you need any additional information.`;
      }
      // Random comment
      else {
        // Pick a random user
        const randomUserIndex = Math.floor(Math.random() * usersList.length);
        commentUser = usersList[randomUserIndex].id;
        
        // Pick a random comment
        const comments = [
          "I've escalated this to the network team for further investigation.",
          "This appears to be a known issue. Working on implementing the fix.",
          "Could you try restarting your device and let me know if the issue persists?",
          "I've checked the logs and found a potential cause. Working on a solution.",
          "This is a duplicate of an existing issue. I'll link the tickets.",
          "I need additional information to continue troubleshooting.",
          "The issue has been identified and should be resolved now."
        ];
        
        const randomCommentIndex = Math.floor(Math.random() * comments.length);
        commentContent = comments[randomCommentIndex];
      }
      
      const commentData: InsertTicketComment = {
        ticketId: ticket.id,
        userId: commentUser,
        content: commentContent,
        attachments: []
      };
      
      await db.insert(ticketComments).values(commentData);
    }
  }
}

// Run the seed function
seedDatabase().catch(console.error);