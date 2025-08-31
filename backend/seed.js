const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ticket = require('./models/Ticket');
const KnowledgeBase = require('./models/KnowledgeBase');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/it-helpdesk');

const sampleTickets = [
  {
    title: 'Password Reset Request',
    description: 'I forgot my password and cannot access my account',
    category: 'password_reset',
    priority: 'medium',
    status: 'resolved',
    requester: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Sales'
    },
    automated: true,
    comments: [{
      author: 'System',
      content: 'Password reset email sent successfully.',
      timestamp: new Date()
    }]
  },
  {
    title: 'Software Installation Issue',
    description: 'Need help installing Microsoft Office on my new laptop',
    category: 'software_issue',
    priority: 'low',
    status: 'open',
    requester: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Marketing'
    },
    automated: false
  },
  {
    title: 'Network Connectivity Problems',
    description: 'Cannot connect to the company VPN from home',
    category: 'network_issue',
    priority: 'high',
    status: 'in_progress',
    requester: {
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      department: 'Engineering'
    },
    assignee: {
      name: 'IT Support',
      email: 'support@company.com'
    },
    automated: false,
    comments: [{
      author: 'IT Support',
      content: 'We are investigating the VPN connectivity issue.',
      timestamp: new Date()
    }]
  }
];

const sampleKnowledgeBase = [
  {
    title: 'How to Reset Your Password',
    content: `To reset your password:
    
1. Go to the login page
2. Click on "Forgot Password"
3. Enter your email address
4. Check your email for reset instructions
5. Follow the link and create a new password

If you don't receive the email within 10 minutes, check your spam folder or contact IT support.`,
    category: 'password_reset',
    keywords: ['password', 'reset', 'forgot', 'login'],
    tags: ['self-service', 'account'],
    helpfulCount: 25,
    notHelpfulCount: 2,
    views: 150,
    author: {
      name: 'IT Support Team',
      email: 'support@company.com'
    }
  },
  {
    title: 'Setting Up VPN Connection',
    content: `To set up VPN connection:

1. Download the VPN client from the company portal
2. Install the application
3. Enter your credentials (username/password)
4. Select the appropriate server location
5. Click Connect

For troubleshooting:
- Ensure you have a stable internet connection
- Check firewall settings
- Verify your credentials are correct
- Contact IT if the issue persists`,
    category: 'network_issue',
    keywords: ['vpn', 'connection', 'setup', 'remote'],
    tags: ['network', 'remote-work'],
    helpfulCount: 18,
    notHelpfulCount: 1,
    views: 89,
    author: {
      name: 'Network Team',
      email: 'network@company.com'
    }
  },
  {
    title: 'Software Installation Guide',
    content: `Before installing new software:

1. Check if the software is approved by IT
2. Verify system requirements
3. Close all running applications
4. Run the installer as administrator
5. Follow installation prompts
6. Restart your computer if required

If you encounter issues:
- Check available disk space
- Disable antivirus temporarily
- Run Windows Update
- Contact IT for assistance`,
    category: 'software_issue',
    keywords: ['software', 'installation', 'install', 'program'],
    tags: ['installation', 'troubleshooting'],
    helpfulCount: 22,
    notHelpfulCount: 3,
    views: 134,
    author: {
      name: 'IT Support Team',
      email: 'support@company.com'
    }
  },
  {
    title: 'Email Setup on Mobile Devices',
    content: `To set up company email on your mobile device:

iOS:
1. Go to Settings > Mail > Accounts
2. Add Account > Exchange
3. Enter your email and password
4. Server: mail.company.com
5. Enable Mail, Contacts, Calendar

Android:
1. Open Email app
2. Add Account > Exchange
3. Enter email and password
4. Server: mail.company.com
5. Complete setup

Note: You may need to install the company authenticator app for security.`,
    category: 'email',
    keywords: ['email', 'mobile', 'setup', 'phone'],
    tags: ['email', 'mobile', 'setup'],
    helpfulCount: 31,
    notHelpfulCount: 4,
    views: 203,
    author: {
      name: 'IT Support Team',
      email: 'support@company.com'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Clear existing data
    await Ticket.deleteMany({});
    await KnowledgeBase.deleteMany({});
    
    // Insert sample data
    await Ticket.insertMany(sampleTickets);
    await KnowledgeBase.insertMany(sampleKnowledgeBase);
    
    console.log('Database seeded successfully!');
    console.log(`Created ${sampleTickets.length} tickets`);
    console.log(`Created ${sampleKnowledgeBase.length} knowledge base articles`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();