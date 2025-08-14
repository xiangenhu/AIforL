/**
 * xAPI Vocabulary for CAR Framework
 * Defines verbs, activities, and extensions for language learning
 */

const CARVocabulary = {
  // Base URIs
  base: {
    verbs: 'http://aiforl.edu/xapi/verbs/',
    activities: 'http://aiforl.edu/xapi/activities/',
    extensions: 'http://aiforl.edu/xapi/extensions/'
  },

  // Custom verbs for language learning
  verbs: {
    // Project lifecycle verbs
    'created-project': {
      id: 'http://aiforl.edu/xapi/verbs/created-project',
      display: { 'en-US': 'created project', 'zh-CN': '创建项目' }
    },
    'advanced-stage': {
      id: 'http://aiforl.edu/xapi/verbs/advanced-stage',
      display: { 'en-US': 'advanced to stage', 'zh-CN': '进入阶段' }
    },
    'submitted-work': {
      id: 'http://aiforl.edu/xapi/verbs/submitted-work',
      display: { 'en-US': 'submitted work', 'zh-CN': '提交作品' }
    },
    
    // AI tool verbs
    'used-ai-tool': {
      id: 'http://aiforl.edu/xapi/verbs/used-ai-tool',
      display: { 'en-US': 'used AI tool', 'zh-CN': '使用AI工具' }
    },
    'engineered-prompt': {
      id: 'http://aiforl.edu/xapi/verbs/engineered-prompt',
      display: { 'en-US': 'engineered prompt', 'zh-CN': '设计提示词' }
    },
    'refined-prompt': {
      id: 'http://aiforl.edu/xapi/verbs/refined-prompt',
      display: { 'en-US': 'refined prompt', 'zh-CN': '优化提示词' }
    },
    
    // Learning verbs
    'reflected-on': {
      id: 'http://aiforl.edu/xapi/verbs/reflected-on',
      display: { 'en-US': 'reflected on', 'zh-CN': '反思' }
    },
    'collaborated-with': {
      id: 'http://aiforl.edu/xapi/verbs/collaborated-with',
      display: { 'en-US': 'collaborated with', 'zh-CN': '协作' }
    },
    'assessed-critically': {
      id: 'http://aiforl.edu/xapi/verbs/assessed-critically',
      display: { 'en-US': 'critically assessed', 'zh-CN': '批判性评估' }
    }
  },

  // Activity types
  activityTypes: {
    'language-project': 'http://aiforl.edu/xapi/activities/language-project',
    'ai-tool': 'http://aiforl.edu/xapi/activities/ai-tool',
    'prompt-engineering': 'http://aiforl.edu/xapi/activities/prompt-engineering',
    'reflection': 'http://aiforl.edu/xapi/activities/reflection',
    'peer-review': 'http://aiforl.edu/xapi/activities/peer-review',
    'learning-outcome': 'http://aiforl.edu/xapi/activities/learning-outcome'
  },

  // Extensions for additional context
  extensions: {
    // Project extensions
    'project-id': 'http://aiforl.edu/xapi/extensions/project-id',
    'project-stage': 'http://aiforl.edu/xapi/extensions/project-stage',
    'project-language': 'http://aiforl.edu/xapi/extensions/project-language',
    'project-title': 'http://aiforl.edu/xapi/extensions/project-title',
    'project-theme': 'http://aiforl.edu/xapi/extensions/project-theme',
    
    // AI tool extensions
    'ai-tool-name': 'http://aiforl.edu/xapi/extensions/ai-tool-name',
    'ai-tool-purpose': 'http://aiforl.edu/xapi/extensions/ai-tool-purpose',
    'prompt-technique': 'http://aiforl.edu/xapi/extensions/prompt-technique',
    'prompt-refinements': 'http://aiforl.edu/xapi/extensions/prompt-refinements',
    
    // Learning extensions
    'ilo-id': 'http://aiforl.edu/xapi/extensions/ilo-id',
    'ilo-evidence': 'http://aiforl.edu/xapi/extensions/ilo-evidence',
    'reflection-type': 'http://aiforl.edu/xapi/extensions/reflection-type',
    'collaboration-partners': 'http://aiforl.edu/xapi/extensions/collaboration-partners',
    
    // User extensions
    'user-role': 'http://aiforl.edu/xapi/extensions/user-role',
    'user-proficiency': 'http://aiforl.edu/xapi/extensions/user-proficiency',
    
    // Assessment extensions
    'assessment-weight': 'http://aiforl.edu/xapi/extensions/assessment-weight',
    'assessment-criteria': 'http://aiforl.edu/xapi/extensions/assessment-criteria'
  },

  // ILO definitions
  ilos: {
    'use-explain-evaluate': {
      id: 'http://aiforl.edu/xapi/activities/ilo/use-explain-evaluate',
      name: { 
        'en-US': 'Use, Explain and Evaluate AI Tools',
        'zh-CN': '使用、解释和评估AI工具'
      },
      description: {
        'en-US': 'Use and describe AI tools for language production and assess their benefits and limitations',
        'zh-CN': '使用和描述用于语言生产的AI工具，并评估其优势和局限性'
      }
    },
    'apply-ethical-guidelines': {
      id: 'http://aiforl.edu/xapi/activities/ilo/apply-ethical-guidelines',
      name: {
        'en-US': 'Apply Ethical Guidelines in AI Use',
        'zh-CN': '在AI使用中应用道德准则'
      },
      description: {
        'en-US': 'Demonstrate responsible AI use through academic integrity and data protection',
        'zh-CN': '通过学术诚信和数据保护展示负责任的AI使用'
      }
    },
    'design-refine-prompts': {
      id: 'http://aiforl.edu/xapi/activities/ilo/design-refine-prompts',
      name: {
        'en-US': 'Design and Refine Effective Prompts',
        'zh-CN': '设计和优化有效提示词'
      },
      description: {
        'en-US': 'Create and iteratively improve prompts for context-appropriate AI support',
        'zh-CN': '创建并迭代改进提示词以获得适合语境的AI支持'
      }
    },
    'critically-assess-output': {
      id: 'http://aiforl.edu/xapi/activities/ilo/critically-assess-output',
      name: {
        'en-US': 'Critically Assess AI-Generated Output',
        'zh-CN': '批判性评估AI生成的输出'
      },
      description: {
        'en-US': 'Analyze AI content for linguistic accuracy and cultural appropriateness',
        'zh-CN': '分析AI内容的语言准确性和文化适当性'
      }
    },
    'integrate-personalized-learning': {
      id: 'http://aiforl.edu/xapi/activities/ilo/integrate-personalized-learning',
      name: {
        'en-US': 'Integrate AI into Personalized Learning',
        'zh-CN': '将AI整合到个性化学习中'
      },
      description: {
        'en-US': 'Support self-directed learning with goal setting and progress monitoring',
        'zh-CN': '通过目标设定和进度监控支持自主学习'
      }
    }
  },

  // Helper function to create full URIs
  getURI: function(type, key) {
    switch(type) {
      case 'verb':
        return this.verbs[key]?.id || `${this.base.verbs}${key}`;
      case 'activity':
        return this.activityTypes[key] || `${this.base.activities}${key}`;
      case 'extension':
        return this.extensions[key] || `${this.base.extensions}${key}`;
      case 'ilo':
        return this.ilos[key]?.id || `${this.base.activities}ilo/${key}`;
      default:
        return key;
    }
  }
};

module.exports = CARVocabulary;