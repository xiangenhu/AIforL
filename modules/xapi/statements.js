/**
 * xAPI Statement Builders for CAR Framework
 * Generates xAPI statements for language learning activities
 */

const { v4: uuidv4 } = require('uuid');

class XAPIStatementBuilder {
  constructor(config) {
    this.endpoint = config.endpoint;
    this.version = config.version || '1.0.3';
    this.activityBase = config.activityBase || 'http://aiforl.edu/activities';
  }

  // Create actor object from user data
  createActor(user) {
    return {
      objectType: 'Agent',
      account: {
        name: user.id,
        homePage: 'http://aiforl.edu'
      },
      name: user.name
    };
  }

  // Project-related statements
  createProjectStatement(user, projectId, stage, language) {
    return {
      id: uuidv4(),
      actor: this.createActor(user),
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/initialized',
        display: { 'en-US': 'initialized' }
      },
      object: {
        id: `${this.activityBase}/project/${projectId}`,
        objectType: 'Activity',
        definition: {
          type: 'http://aiforl.edu/activities/language-project',
          name: { 'en-US': `Language Project - ${stage}` },
          extensions: {
            'http://aiforl.edu/extensions/stage': stage,
            'http://aiforl.edu/extensions/language': language,
            'http://aiforl.edu/extensions/project-id': projectId
          }
        }
      },
      context: this.createContext(user.role, stage),
      timestamp: new Date().toISOString()
    };
  }

  // AI tool usage statements
  createAIToolStatement(user, tool, purpose, projectId) {
    return {
      id: uuidv4(),
      actor: this.createActor(user),
      verb: {
        id: 'http://aiforl.edu/verbs/used-ai-tool',
        display: { 'en-US': 'used AI tool' }
      },
      object: {
        id: `${this.activityBase}/ai-tool/${tool}`,
        objectType: 'Activity',
        definition: {
          type: 'http://aiforl.edu/activities/ai-tool',
          name: { 'en-US': tool },
          description: { 'en-US': `Used ${tool} for ${purpose}` }
        }
      },
      context: {
        ...this.createContext(user.role),
        extensions: {
          'http://aiforl.edu/extensions/purpose': purpose,
          'http://aiforl.edu/extensions/project-id': projectId
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  // Prompt engineering statements
  createPromptStatement(user, prompt, refinements, effectiveness) {
    return {
      id: uuidv4(),
      actor: this.createActor(user),
      verb: {
        id: 'http://aiforl.edu/verbs/engineered-prompt',
        display: { 'en-US': 'engineered prompt' }
      },
      object: {
        id: `${this.activityBase}/prompt/${uuidv4()}`,
        objectType: 'Activity',
        definition: {
          type: 'http://aiforl.edu/activities/prompt-engineering',
          description: { 'en-US': prompt.substring(0, 100) + '...' }
        }
      },
      result: {
        score: {
          raw: effectiveness,
          min: 0,
          max: 10
        },
        extensions: {
          'http://aiforl.edu/extensions/refinements': refinements,
          'http://aiforl.edu/extensions/technique': 'chain-of-thought'
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  // ILO achievement statements
  createILOStatement(user, ilo, level, evidence) {
    const iloMap = {
      'use-explain-evaluate': 'Use, Explain and Evaluate AI Tools',
      'apply-ethical-guidelines': 'Apply Ethical Guidelines',
      'design-refine-prompts': 'Design and Refine Prompts',
      'critically-assess-output': 'Critically Assess Output',
      'integrate-personalized-learning': 'Integrate Personalized Learning'
    };

    return {
      id: uuidv4(),
      actor: this.createActor(user),
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/achieved',
        display: { 'en-US': 'achieved' }
      },
      object: {
        id: `${this.activityBase}/ilo/${ilo}`,
        objectType: 'Activity',
        definition: {
          type: 'http://aiforl.edu/activities/learning-outcome',
          name: { 'en-US': iloMap[ilo] || ilo }
        }
      },
      result: {
        score: {
          scaled: level / 100,
          raw: level,
          min: 0,
          max: 100
        },
        extensions: {
          'http://aiforl.edu/extensions/evidence': evidence
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  // Helper to create context
  createContext(role, stage = null) {
    const context = {
      registration: uuidv4(),
      platform: 'AI-Assisted Language Learning Platform',
      language: 'en-US',
      extensions: {
        'http://aiforl.edu/extensions/user-role': role
      }
    };

    if (stage) {
      context.extensions['http://aiforl.edu/extensions/project-stage'] = stage;
    }

    return context;
  }
}

module.exports = XAPIStatementBuilder;