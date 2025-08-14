/**
 * Application configuration
 */
const config = {
  // Application settings
  app: {
    name: 'Lesson Plan Generator',
    description: 'Create comprehensive lesson plans with AI assistance',
    version: '1.0.0'
  },
  
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Debugging settings
  debug: {
    enabled: process.env.DEBUG_MODE === 'true' || true, // Default to true for testing
    verbose: process.env.DEBUG_VERBOSE === 'true' || true, // Default to true for testing
    logLLMRequests: process.env.DEBUG_LLM_REQUESTS === 'true' || true, // Default to true for testing
    logLLMResponses: process.env.DEBUG_LLM_RESPONSES === 'true' || true // Default to true for testing
  },
  
  // LLM settings
  llm: {
    defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
    providers: {
      openai: {
        enabled: !!process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4'
      },
      anthropic: {
        enabled: !!process.env.ANTHROPIC_API_KEY,
        modelName: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229'
      }
    }
  },
  
  // Lesson plan settings
  lessonPlan: {
    defaultDurations: [
      '30 minutes',
      '45 minutes',
      '60 minutes',
      '90 minutes',
      '2 hours'
    ],
    gradeLevels: [
      'Pre-K',
      'Kindergarten',
      'Grade 1',
      'Grade 2',
      'Grade 3',
      'Grade 4',
      'Grade 5',
      'Grade 6',
      'Grade 7',
      'Grade 8',
      'Grade 9',
      'Grade 10',
      'Grade 11',
      'Grade 12',
      'College - Undergraduate',
      'College - Graduate'
    ],
    subjectAreas: [
      'Mathematics',
      'Science',
      'Language Arts',
      'Social Studies',
      'History',
      'Geography',
      'Art',
      'Music',
      'Physical Education',
      'Foreign Language',
      'Computer Science',
      'Health',
      'Economics',
      'Psychology',
      'Philosophy',
      'Other'
    ]
  }
};

module.exports = config;
