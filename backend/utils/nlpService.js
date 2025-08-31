// Simple NLP service for categorizing and analyzing IT requests
class NLPService {
  constructor() {
    // Keywords for different categories
    this.categoryKeywords = {
      password_reset: ['password', 'reset', 'forgot', 'login', 'signin', 'access', 'unlock', 'locked'],
      software_issue: ['software', 'application', 'app', 'program', 'install', 'update', 'crash', 'error', 'bug'],
      hardware_issue: ['hardware', 'computer', 'laptop', 'mouse', 'keyboard', 'monitor', 'printer', 'broken'],
      network_issue: ['network', 'internet', 'wifi', 'connection', 'slow', 'disconnect', 'vpn'],
      account_provisioning: ['account', 'user', 'access', 'permission', 'create', 'new user', 'provision']
    };
    
    // Priority keywords
    this.priorityKeywords = {
      critical: ['critical', 'urgent', 'emergency', 'down', 'outage', 'broken', 'not working'],
      high: ['important', 'asap', 'soon', 'blocking', 'cannot work'],
      medium: ['help', 'issue', 'problem'],
      low: ['question', 'how to', 'when possible']
    };
    
    // Intent keywords
    this.intentKeywords = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'help'],
      check_status: ['status', 'check', 'update', 'ticket', 'progress']
    };
  }
  
  async analyzeRequest(text) {
    const lowerText = text.toLowerCase();
    
    // Determine category
    let category = 'other';
    let maxMatches = 0;
    
    for (const [cat, keywords] of Object.entries(this.categoryKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat;
      }
    }
    
    // Determine priority
    let priority = 'medium';
    for (const [prio, keywords] of Object.entries(this.priorityKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        priority = prio;
        break;
      }
    }
    
    // Determine intent
    let intent = 'support_request';
    for (const [int, keywords] of Object.entries(this.intentKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        intent = int;
        break;
      }
    }
    
    // Extract potential tags
    const tags = [];
    const words = lowerText.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && !['with', 'from', 'that', 'this', 'have', 'need'].includes(word)) {
        tags.push(word);
      }
    });
    
    return {
      category,
      priority,
      intent,
      tags: tags.slice(0, 5), // Limit to 5 tags
      confidence: maxMatches > 0 ? Math.min(maxMatches * 0.3, 1) : 0.1
    };
  }
  
  // Method to use with OpenAI GPT (if API key is available)
  async analyzeWithGPT(text) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.analyzeRequest(text); // Fallback to simple analysis
      }
      
      // This would integrate with OpenAI API
      // For now, return simple analysis
      return this.analyzeRequest(text);
    } catch (error) {
      console.error('GPT analysis failed:', error);
      return this.analyzeRequest(text);
    }
  }
}

module.exports = new NLPService();