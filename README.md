# IT Helpdesk Automation System

A comprehensive IT helpdesk automation system that streamlines support through a chatbot interface and automated workflows. The system uses natural language processing to categorize and prioritize IT requests, integrates with ticketing systems, and provides automated solutions for routine tasks.

## Features

###  Intelligent Chatbot
- Natural language processing for request categorization
- Context-aware responses and suggestions
- Knowledge base integration for instant solutions
- Automated ticket creation for complex issues

###  Ticket Management
- Automated ticket creation and categorization
- Priority assignment based on request analysis
- Real-time status updates and notifications
- Integration with external ticketing systems (ServiceNow, Jira, Zendesk)

###  Workflow Automation
- Automated password resets
- Account provisioning workflows
- Routine task handling
- Escalation to human agents for complex issues

###  Analytics Dashboard
- Real-time metrics and KPIs
- Response time tracking
- Automation rate monitoring
- Satisfaction surveys and reporting

###  Knowledge Base
- Searchable article repository
- Category-based organization
- User rating system
- View tracking and analytics

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Socket.io** for real-time communication
- **Natural Language Processing** for request analysis

### Frontend
- **React** with Material-UI
- **Recharts** for analytics visualization
- **Socket.io Client** for real-time updates
- **Axios** for API communication

### Integrations
- OpenAI GPT (optional for enhanced NLP)
- ServiceNow, Jira, Zendesk APIs
- Email/SMS notification services

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alinapradhan/IT-Helpdesk-Automation.git
   cd IT-Helpdesk-Automation
   ```

2. **Install dependencies:**
   ```bash
   npm run install-deps
   ```

3. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application:**
   ```bash
   # Development mode (starts both backend and frontend)
   npm run dev

   # Or start separately:
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### For End Users
1. **Chat Interface**: Visit the main page to interact with the IT support chatbot
2. **Request Help**: Describe your IT issue in natural language
3. **Follow Suggestions**: The bot will provide solutions or create tickets automatically
4. **Track Tickets**: Monitor your request status in real-time

### For IT Staff
1. **Dashboard**: View analytics and system metrics
2. **Ticket Management**: Review, assign, and update tickets
3. **Knowledge Base**: Manage articles and solutions
4. **Automation Rules**: Configure workflows for routine tasks

## API Endpoints

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment

### Chatbot
- `POST /api/chatbot/message` - Process chat message
- `POST /api/chatbot/password-reset` - Automated password reset

### Knowledge Base
- `GET /api/knowledge-base` - List articles
- `GET /api/knowledge-base/:id` - Get article
- `POST /api/knowledge-base/:id/rate` - Rate article

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/satisfaction` - Satisfaction data
- `GET /api/analytics/performance` - Performance metrics

## Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-helpdesk
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### Automation Rules
The system includes pre-configured automation for:
- Password reset requests
- Account provisioning
- Basic troubleshooting guidance

### NLP Categories
- Password Reset
- Software Issues
- Hardware Issues
- Network Issues
- Account Provisioning
- General Support

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB instance
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the knowledge base for common solutions
