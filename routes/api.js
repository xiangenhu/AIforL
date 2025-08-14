const express = require('express');
const router = express.Router();
const llmService = require('../utils/llmService');
const config = require('../config/config');

// Log debug status on module load
console.warn('API Routes loaded with debug settings:', JSON.stringify(config.debug, null, 2));

// Debug middleware for API routes
function debugMiddleware(req, res, next) {
  // Always log this message regardless of debug settings
  console.log(`API DEBUG CHECK: Debug enabled=${config.debug.enabled}, verbose=${config.debug.verbose}, URL=${req.originalUrl}`);
  
  if (config.debug.enabled) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [API-REQUEST] ${req.method} ${req.originalUrl}`);
    
    if (config.debug.verbose) {
      console.warn(`[${timestamp}] [API-REQUEST-BODY] ${JSON.stringify(req.body, null, 2)}`);
    }
    
    // Capture the original res.json method
    const originalJson = res.json;
    
    // Override res.json to log the response
    res.json = function(data) {
      if (config.debug.verbose) {
        console.warn(`[${timestamp}] [API-RESPONSE] ${JSON.stringify(data, null, 2)}`);
      } else {
        console.warn(`[${timestamp}] [API-RESPONSE] Status: ${res.statusCode}, Success: ${data.success}`);
      }
      
      // Add debug info to response if debugging is enabled
      if (config.debug.enabled && data) {
        data._debug = {
          timestamp,
          route: req.originalUrl,
          method: req.method,
          responseTime: new Date().getTime() - new Date(timestamp).getTime(),
          debugEnabled: config.debug.enabled,
          verboseEnabled: config.debug.verbose
        };
      }
      
      // Call the original method
      return originalJson.call(this, data);
    };
  }
  
  next();
}

// Apply debug middleware to all routes
router.use(debugMiddleware);

// Route to toggle debug mode
router.post('/debug/toggle', (req, res) => {
  const { enabled, verbose, logLLMRequests, logLLMResponses } = req.body;
  
  // Update debug settings if provided
  if (typeof enabled === 'boolean') {
    config.debug.enabled = enabled;
  }
  
  if (typeof verbose === 'boolean') {
    config.debug.verbose = verbose;
  }
  
  if (typeof logLLMRequests === 'boolean') {
    config.debug.logLLMRequests = logLLMRequests;
  }
  
  if (typeof logLLMResponses === 'boolean') {
    config.debug.logLLMResponses = logLLMResponses;
  }
  
  // Return current debug settings
  res.json({
    success: true,
    debug: {
      enabled: config.debug.enabled,
      verbose: config.debug.verbose,
      logLLMRequests: config.debug.logLLMRequests,
      logLLMResponses: config.debug.logLLMResponses
    }
  });
});

// Route to get current debug status
router.get('/debug/status', (req, res) => {
  res.json({
    success: true,
    debug: {
      enabled: config.debug.enabled,
      verbose: config.debug.verbose,
      logLLMRequests: config.debug.logLLMRequests,
      logLLMResponses: config.debug.logLLMResponses
    }
  });
});

// Route to generate context-sensitive choices for form fields
router.post('/generate-choices', async (req, res) => {
  try {
    const { fieldName, fieldType, context } = req.body;
    
    if (!fieldName || !fieldType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: fieldName and fieldType are required'
      });
    }
    
    // Generate choices using LLM service
    const choices = await llmService.generateChoices(fieldName, fieldType, context || {});
    
    res.json({ success: true, choices });
  } catch (error) {
    console.error('Error generating choices:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate choices',
      details: error.message
    });
  }
});

// Route to generate a lesson plan using LLM
router.post('/generate-lesson-plan', async (req, res) => {
  try {
    const { 
      subject, 
      gradeLevel, 
      duration, 
      objectives, 
      resources,
      teachingStyle,
      assessmentPreferences,
      additionalNotes
    } = req.body;
    
    // Generate lesson plan using LLM service
    const lessonPlan = await llmService.generateLessonPlan({
      subject,
      gradeLevel,
      duration,
      objectives,
      resources,
      teachingStyle,
      assessmentPreferences,
      additionalNotes
    });
    
    res.json({ success: true, lessonPlan });
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate lesson plan',
      details: error.message
    });
  }
});

// Route to get suggestions for lesson objectives
router.post('/suggest-objectives', async (req, res) => {
  try {
    const { subject, gradeLevel, specificTopic } = req.body;
    
    // Get objective suggestions using LLM service
    const suggestions = await llmService.suggestObjectives(subject, gradeLevel, specificTopic);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error suggesting objectives:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to suggest objectives',
      details: error.message
    });
  }
});

// Route to get comprehensive lesson planning suggestions
router.post('/suggest-lesson-content', async (req, res) => {
  try {
    const { subject, gradeLevel, specificTopic, type, debug, verbose } = req.body;
    
    // If debug is requested in the body, override the config setting temporarily
    const originalDebugEnabled = config.debug.enabled;
    const originalDebugVerbose = config.debug.verbose;
    
    if (debug === true) {
      config.debug.enabled = true;
    }
    
    if (verbose === true) {
      config.debug.verbose = true;
    }
    
    // Get comprehensive suggestions using LLM service
    const suggestions = await llmService.suggestLessonContent(subject, gradeLevel, specificTopic);
    
    // Filter suggestions based on type if specified
    let filteredSuggestions = { ...suggestions };
    if (type) {
      console.log(`Filtering suggestions for type: ${type}`);
      
      // If a specific type is requested, only return that type of suggestions
      if (type === 'objectives') {
        filteredSuggestions = {
          objectives: suggestions.objectives || []
        };
      } else if (type === 'priorKnowledge') {
        filteredSuggestions = {
          priorKnowledge: suggestions.priorKnowledge || []
        };
      } else if (type === 'standards') {
        filteredSuggestions = {
          standards: suggestions.standards || []
        };
      }
      
      // Preserve debug information if present
      if (suggestions._debug) {
        filteredSuggestions._debug = suggestions._debug;
      }
    }
    
    // Restore original debug settings
    config.debug.enabled = originalDebugEnabled;
    config.debug.verbose = originalDebugVerbose;
    
    // Add raw response to suggestions if debugging is enabled
    if (debug === true && filteredSuggestions) {
      // Store the raw response for debugging if available
      if (filteredSuggestions._debug) {
        filteredSuggestions.rawResponse = filteredSuggestions._debug.rawResponse;
      }
    }
    
    res.json({ success: true, suggestions: filteredSuggestions });
  } catch (error) {
    console.error('Error suggesting lesson content:', error);
    
    // Include more detailed error information if debugging is enabled
    const errorResponse = { 
      success: false, 
      error: 'Failed to suggest lesson content',
      details: error.message
    };
    
    if (req.body.debug === true) {
      errorResponse.stack = error.stack;
      errorResponse.fullError = error.toString();
    }
    
    res.status(500).json(errorResponse);
  }
});

// Route to get suggestions for teaching activities
router.post('/suggest-activities', async (req, res) => {
  try {
    const { subject, gradeLevel, objectives } = req.body;
    
    // Get activity suggestions using LLM service
    const suggestions = await llmService.suggestActivities(subject, gradeLevel, objectives);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error suggesting activities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to suggest activities',
      details: error.message
    });
  }
});

module.exports = router;
