/**
 * LRS Client for xAPI Communication
 * Handles all interactions with the Learning Record Store
 */

const axios = require('axios');

class LRSClient {
  constructor(config) {
    this.endpoint = config.endpoint || process.env.LRS_ENDPOINT;
    this.auth = config.auth || process.env.LRS_AUTH;
    this.version = config.version || '1.0.3';
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.endpoint,
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'X-Experience-API-Version': this.version,
        'Content-Type': 'application/json'
      }
    });
  }

  // Send single statement to LRS
  async sendStatement(statement) {
    try {
      const response = await this.client.post('/statements', statement);
      return {
        success: true,
        statementId: response.data[0],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('LRS send error:', error.response?.data || error.message);
      throw new Error(`Failed to send statement: ${error.message}`);
    }
  }

  // Send multiple statements
  async sendStatements(statements) {
    try {
      const response = await this.client.post('/statements', statements);
      return {
        success: true,
        statementIds: response.data,
        count: statements.length
      };
    } catch (error) {
      console.error('LRS batch send error:', error);
      throw new Error(`Failed to send statements: ${error.message}`);
    }
  }

  // Query statements from LRS
  async queryStatements(params) {
    try {
      const response = await this.client.get('/statements', { params });
      return {
        statements: response.data.statements || [],
        more: response.data.more || null,
        count: response.data.statements?.length || 0
      };
    } catch (error) {
      console.error('LRS query error:', error);
      throw new Error(`Failed to query statements: ${error.message}`);
    }
  }

  // Get specific statement by ID
  async getStatement(statementId) {
    try {
      const response = await this.client.get('/statements', {
        params: { statementId }
      });
      return response.data;
    } catch (error) {
      console.error('LRS get statement error:', error);
      throw new Error(`Failed to get statement: ${error.message}`);
    }
  }

  // Query statements for a specific actor
  async getActorStatements(actor, filters = {}) {
    const params = {
      agent: JSON.stringify(actor),
      ...filters
    };
    return this.queryStatements(params);
  }

  // Query statements for a specific activity
  async getActivityStatements(activityId, filters = {}) {
    const params = {
      activity: activityId,
      related_activities: true,
      ...filters
    };
    return this.queryStatements(params);
  }

  // Get project-specific statements
  async getProjectStatements(projectId, actor = null) {
    const params = {
      activity: `http://aiforl.edu/activities/project/${projectId}`,
      related_activities: true
    };
    
    if (actor) {
      params.agent = JSON.stringify(actor);
    }
    
    return this.queryStatements(params);
  }

  // Get ILO progress for a user
  async getILOProgress(actor) {
    const iloActivities = [
      'use-explain-evaluate',
      'apply-ethical-guidelines',
      'design-refine-prompts',
      'critically-assess-output',
      'integrate-personalized-learning'
    ];
    
    const progress = {};
    
    for (const ilo of iloActivities) {
      const params = {
        agent: JSON.stringify(actor),
        activity: `http://aiforl.edu/xapi/activities/ilo/${ilo}`,
        verb: 'http://adlnet.gov/expapi/verbs/achieved'
      };
      
      const result = await this.queryStatements(params);
      
      // Get latest achievement
      if (result.statements.length > 0) {
        const latest = result.statements[0];
        progress[ilo] = {
          score: latest.result?.score?.raw || 0,
          timestamp: latest.timestamp,
          evidence: latest.result?.extensions?.['http://aiforl.edu/xapi/extensions/ilo-evidence']
        };
      } else {
        progress[ilo] = { score: 0, timestamp: null, evidence: null };
      }
    }
    
    return progress;
  }

  // Initialize LRS with sample data
  async initializeSampleData() {
    const sampleStatements = [
      {
        actor: {
          account: { name: 'demo_learner', homePage: 'http://aiforl.edu' },
          name: 'Demo Learner'
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/initialized',
          display: { 'en-US': 'initialized' }
        },
        object: {
          id: 'http://aiforl.edu/platform',
          definition: {
            type: 'http://adlnet.gov/expapi/activities/application',
            name: { 'en-US': 'AI-Assisted Language Learning Platform' }
          }
        },
        timestamp: new Date().toISOString()
      }
    ];
    
    return this.sendStatements(sampleStatements);
  }
}

// Export singleton instance
const lrsClient = new LRSClient({
  endpoint: process.env.LRS_ENDPOINT,
  auth: process.env.LRS_AUTH
});

// Helper functions for common operations
const sendToLRS = (statement) => lrsClient.sendStatement(statement);
const queryLRS = (params) => lrsClient.queryStatements(params);
const getILOProgress = (actor) => lrsClient.getILOProgress(actor);

module.exports = {
  LRSClient,
  lrsClient,
  sendToLRS,
  queryLRS,
  getILOProgress
};