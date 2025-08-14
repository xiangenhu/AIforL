const axios = require('axios');
const config = require('../config/config');

// Debug logger function
function debugLog(message, data = null, type = 'info') {
  // Always log this message regardless of debug settings
  console.log(`DEBUG CHECK: Debug enabled=${config.debug.enabled}, verbose=${config.debug.verbose}`);
  
  if (!config.debug.enabled) return;
  
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [LLM-${type.toUpperCase()}] ${message}`;
  
  if (config.debug.verbose && data) {
    if (typeof data === 'object') {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      logMessage += `\n${data}`;
    }
  }
  
  // Use console.warn for better visibility
  console.warn(logMessage);
}

// Log debug status on module load
console.warn('LLM Service loaded with debug settings:', JSON.stringify(config.debug, null, 2));

class LLMService {
  constructor() {
    this.providers = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1',
        headers: () => ({
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }),
        modelName: 'gpt-4'
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseUrl: 'https://api.anthropic.com/v1',
        headers: () => ({
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json'
        }),
        modelName: 'claude-3-opus-20240229'
      }
    };
    
    // Default to OpenAI if available, otherwise use the first available provider
    this.defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 
      (process.env.OPENAI_API_KEY ? 'openai' : 
       (process.env.ANTHROPIC_API_KEY ? 'anthropic' : null));
    
    if (!this.defaultProvider) {
      console.warn('No LLM provider API keys found. Please set at least one provider API key.');
    }
  }
  
  /**
   * Get the configured provider for LLM requests
   * @param {string} providerName - Optional provider name to use
   * @returns {Object} Provider configuration
   */
  getProvider(providerName = null) {
    const provider = providerName || this.defaultProvider;
    
    if (!provider || !this.providers[provider]) {
      throw new Error(`LLM provider "${provider}" not found or not configured`);
    }
    
    if (!this.providers[provider].apiKey) {
      throw new Error(`API key for provider "${provider}" not set`);
    }
    
    return this.providers[provider];
  }
  
  /**
   * Make a request to an LLM API
   * @param {string} prompt - The prompt to send to the LLM
   * @param {string} providerName - Optional provider name to use
   * @returns {Promise<string>} The LLM response
   */
  async makeRequest(prompt, providerName = null) {
    const provider = this.getProvider(providerName);
    const providerName2 = providerName || this.defaultProvider;
    
    debugLog(`Making request to ${providerName2} API`, { prompt }, 'request');
    
    try {
      let response;
      let requestPayload;
      let responseContent;
      
      if (provider === this.providers.openai) {
        requestPayload = {
          model: provider.modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        };
        
        debugLog(`OpenAI request payload prepared`, 
          config.debug.logLLMRequests ? requestPayload : null, 
          'request'
        );
        
        response = await axios.post(
          `${provider.baseUrl}/chat/completions`,
          requestPayload,
          { headers: provider.headers() }
        );
        
        responseContent = response.data.choices[0].message.content;
        
        debugLog(`OpenAI response received`, 
          config.debug.logLLMResponses ? {
            status: response.status,
            model: response.data.model,
            content: responseContent
          } : null, 
          'response'
        );
        
        return responseContent;
      } 
      else if (provider === this.providers.anthropic) {
        requestPayload = {
          model: provider.modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        };
        
        debugLog(`Anthropic request payload prepared`, 
          config.debug.logLLMRequests ? requestPayload : null, 
          'request'
        );
        
        response = await axios.post(
          `${provider.baseUrl}/messages`,
          requestPayload,
          { headers: provider.headers() }
        );
        
        responseContent = response.data.content[0].text;
        
        debugLog(`Anthropic response received`, 
          config.debug.logLLMResponses ? {
            status: response.status,
            model: response.data.model,
            content: responseContent
          } : null, 
          'response'
        );
        
        return responseContent;
      }
      
      const errorMsg = `Unsupported provider: ${providerName2}`;
      debugLog(errorMsg, null, 'error');
      throw new Error(errorMsg);
    } catch (error) {
      const errorMsg = `LLM API request failed: ${error.response?.data?.error?.message || error.message}`;
      debugLog(errorMsg, error.response?.data || error, 'error');
      console.error('LLM API request failed:', error.response?.data || error.message);
      throw new Error(errorMsg);
    }
  }
  
  /**
   * Generate a lesson plan based on provided parameters
   * @param {Object} params - Lesson plan parameters
   * @returns {Promise<Object>} Generated lesson plan
   */
  async generateLessonPlan(params) {
    const {
      subject,
      gradeLevel,
      duration,
      objectives,
      resources,
      teachingStyle,
      assessmentPreferences,
      additionalNotes
    } = params;
    
    const prompt = `
      Create a detailed lesson plan with the following parameters:
      
      Subject: ${subject}
      Grade Level: ${gradeLevel}
      Duration: ${duration}
      Learning Objectives: ${objectives}
      Available Resources: ${resources || 'Standard classroom resources'}
      Teaching Style Preferences: ${teachingStyle || 'Balanced approach'}
      Assessment Preferences: ${assessmentPreferences || 'Mix of formative and summative assessments'}
      Additional Notes: ${additionalNotes || 'None'}
      
      Please structure the lesson plan with the following sections:
      1. Lesson Overview (title, subject, grade level, duration)
      2. Learning Objectives
      3. Materials and Resources
      4. Preparation Steps
      5. Introduction/Hook (5-10 minutes)
      6. Main Activities (step-by-step)
      7. Guided Practice
      8. Independent Practice
      9. Assessment Methods
      10. Closure
      11. Extensions/Differentiation
      12. Reflection Questions for Teacher
      
      Format the response as JSON with appropriate sections and subsections.
    `;
    
    const response = await this.makeRequest(prompt);
    
    try {
      // Try to parse the response as JSON
      return JSON.parse(response);
    } catch (error) {
      // If parsing fails, return the raw text
      console.warn('Failed to parse LLM response as JSON, returning raw text');
      return { rawContent: response };
    }
  }
  
  /**
   * Suggest learning objectives based on subject, grade level, and specific topic
   * @param {string} subject - The subject area
   * @param {string} gradeLevel - The grade level
   * @param {string} specificTopic - The specific topic of the lesson (optional)
   * @returns {Promise<Array>} List of suggested objectives
   */
  async suggestObjectives(subject, gradeLevel, specificTopic) {
    const topicText = specificTopic ? `${subject} (specifically on ${specificTopic})` : subject;
    
    const prompt = `
      Suggest 5-7 appropriate learning objectives for a lesson on ${topicText} for ${gradeLevel} students.
      
      Each objective should:
      - Start with an action verb (e.g., identify, analyze, create, evaluate)
      - Be specific and measurable
      - Be aligned with typical educational standards
      - Be appropriate for the grade level
      - Focus on what students will know or be able to do by the end of the lesson
      
      Examples of well-written learning objectives:
      - "Analyze the causes and effects of the Civil War by creating a concept map that shows at least three causes and three effects."
      - "Calculate the area and perimeter of rectangles using the correct formulas and appropriate units of measurement."
      - "Design a controlled experiment to test the effect of light on plant growth, including a hypothesis, variables, and data collection plan."
      - "Evaluate two different interpretations of a poem by comparing the evidence each interpretation uses from the text."
      
      Format the response as a JSON array of strings.
    `;
    
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      // If parsing fails, try to extract objectives from the text
      const objectives = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      return objectives;
    }
  }
  
  /**
   * Suggest comprehensive lesson content including objectives, prior knowledge, and standards
   * @param {string} subject - The subject area
   * @param {string} gradeLevel - The grade level
   * @param {string} specificTopic - The specific topic of the lesson (optional)
   * @returns {Promise<Object>} Object containing objectives, priorKnowledge, and standards
   */
  async suggestLessonContent(subject, gradeLevel, specificTopic) {
    debugLog(`Generating lesson content for ${subject} (${specificTopic}) at ${gradeLevel} level`, null, 'info');
    
    const topicText = specificTopic ? `${subject} (specifically on ${specificTopic})` : subject;
    
    const prompt = `
      Create comprehensive content for a lesson on ${topicText} for ${gradeLevel} students.
      
      Please provide the following three components:
      
      1. LEARNING OBJECTIVES (5-7 objectives):
         Each objective should:
         - Start with an action verb (e.g., identify, analyze, create, evaluate)
         - Be specific and measurable
         - Be aligned with typical educational standards
         - Be appropriate for the grade level
         - Focus on what students will know or be able to do by the end of the lesson
         
         For each objective, also provide a type classification (optional) such as:
         - Cognitive (knowledge, comprehension, application, analysis, synthesis, evaluation)
         - Psychomotor (physical skills)
         - Affective (attitudes, values, feelings)
         - Or other relevant classification
      
      2. PRIOR KNOWLEDGE (3-5 items):
         What students should already know or be able to do before this lesson, including:
         - Prerequisite concepts
         - Previously learned skills
         - Foundational understanding needed
         
         For each prior knowledge item, also provide a type classification (optional) such as:
         - Conceptual knowledge
         - Procedural knowledge
         - Factual knowledge
         - Or other relevant classification
      
      3. EDUCATIONAL STANDARDS (2-4 standards):
         Relevant educational standards that align with this lesson, such as:
         - Common Core State Standards (CCSS)
         - Next Generation Science Standards (NGSS)
         - State-specific standards
         - Other relevant curriculum frameworks
         
         Include the standard code and description when possible.
         
         For each standard, also provide a type classification (optional) such as:
         - Content standard
         - Process standard
         - Performance standard
         - Or other relevant classification
      
      Format the response as a JSON object with three properties:
      - "objectives": an array of objects, each with "text" (the objective) and "type" (optional classification)
      - "priorKnowledge": an array of objects, each with "text" (the knowledge item) and "type" (optional classification)
      - "standards": an array of objects, each with "text" (the standard) and "type" (optional classification)
    `;
    
    const response = await this.makeRequest(prompt);
    debugLog(`Received response for lesson content`, null, 'info');
    
    try {
      debugLog(`Attempting to parse response as JSON`, null, 'parse');
      const parsedResponse = JSON.parse(response);
      debugLog(`Successfully parsed JSON response`, {
        objectivesCount: parsedResponse.objectives?.length || 0,
        priorKnowledgeCount: parsedResponse.priorKnowledge?.length || 0,
        standardsCount: parsedResponse.standards?.length || 0
      }, 'parse');
      return parsedResponse;
    } catch (error) {
      debugLog(`Failed to parse response as JSON: ${error.message}`, null, 'error');
      debugLog(`Raw response received:`, config.debug.verbose ? response : null, 'error');
      
      debugLog(`Attempting manual extraction of content`, null, 'parse');
      
      // Attempt to extract content manually
      const result = {
        objectives: [],
        priorKnowledge: [],
        standards: []
      };
      
      // Simple extraction based on section headers
      const sections = response.split(/\d+\.\s+(LEARNING OBJECTIVES|PRIOR KNOWLEDGE|EDUCATIONAL STANDARDS)/i);
      
      debugLog(`Split response into ${sections.length} sections`, null, 'parse');
      
      for (let i = 1; i < sections.length; i += 2) {
        const sectionType = sections[i].trim().toUpperCase();
        const content = sections[i + 1] || '';
        
        debugLog(`Processing section: ${sectionType}`, null, 'parse');
        
        const items = content
          .split(/\n-|\n\d+\./)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        debugLog(`Extracted ${items.length} items from section ${sectionType}`, null, 'parse');
        
        // Convert items to objects with text and type properties
        const processedItems = items.map(item => {
          // Check if the item contains type information in parentheses or after a dash/colon
          const typeMatch = item.match(/\(([^)]+)\)$/) || item.match(/\s-\s([^:]+)$/) || item.match(/:\s([^.]+)$/);
          
          if (typeMatch) {
            // Extract the type and remove it from the text
            const type = typeMatch[1].trim();
            const text = item.replace(typeMatch[0], '').trim();
            return { text, type };
          }
          
          // If no type is found, just use the item as text
          return { text: item };
        });
        
        if (sectionType.includes('OBJECTIVES')) {
          result.objectives = processedItems;
          debugLog(`Added ${processedItems.length} objectives`, null, 'parse');
        } else if (sectionType.includes('PRIOR KNOWLEDGE')) {
          result.priorKnowledge = processedItems;
          debugLog(`Added ${processedItems.length} prior knowledge items`, null, 'parse');
        } else if (sectionType.includes('STANDARDS')) {
          result.standards = processedItems;
          debugLog(`Added ${processedItems.length} standards`, null, 'parse');
        }
      }
      
      debugLog(`Manual extraction complete`, {
        objectivesCount: result.objectives.length,
        priorKnowledgeCount: result.priorKnowledge.length,
        standardsCount: result.standards.length
      }, 'parse');
      
      // Add debug information to the result if debugging is enabled
      if (config.debug.enabled) {
        result._debug = {
          parseError: error.message,
          extractionMethod: 'manual',
          rawResponseLength: response.length,
          sectionsFound: sections.length
        };
        
        // Store the raw response if verbose debugging is enabled
        if (config.debug.verbose) {
          result._debug.rawResponse = response;
        }
      }
      
      return result;
    }
  }
  
  /**
   * Suggest teaching activities based on subject, grade level, and objectives
   * @param {string} subject - The subject area
   * @param {string} gradeLevel - The grade level
   * @param {string} objectives - The learning objectives
   * @returns {Promise<Array>} List of suggested activities
   */
  async suggestActivities(subject, gradeLevel, objectives) {
    const prompt = `
      Suggest 3-5 engaging teaching activities for a lesson on ${subject} for ${gradeLevel} students.
      The lesson objectives are: ${objectives}
      
      For each activity, provide:
      1. A title
      2. A brief description
      3. Estimated duration
      4. Required materials
      5. How it aligns with the objectives
      
      Format the response as a JSON array of objects with these properties.
    `;
    
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      // If parsing fails, return the raw text
      console.warn('Failed to parse LLM response as JSON, returning raw text');
      return { rawContent: response };
    }
  }
  
  /**
   * Generate context-sensitive choices for a form field
   * @param {string} fieldName - The name of the field
   * @param {string} fieldType - The type of field (select, checkbox, etc.)
   * @param {Object} context - Context information for generating relevant choices
   * @returns {Promise<Array>} List of choices
   */
  async generateChoices(fieldName, fieldType, context = {}) {
    // Extract context variables
    const { subject, gradeLevel, specificTopic, objectives, previousAnswers } = context;
    
    // Build a context-aware prompt based on the field and available context
    let prompt = `Generate appropriate choices for a ${fieldType} field named "${fieldName}" in a lesson plan generator.`;
    
    // Add context-specific information to the prompt
    if (subject) prompt += `\nThe subject area is: ${subject}`;
    if (specificTopic) prompt += `\nThe specific topic is: ${specificTopic}`;
    if (gradeLevel) prompt += `\nThe grade level is: ${gradeLevel}`;
    if (objectives) prompt += `\nThe learning objectives are: ${objectives}`;
    
    // Add field-specific instructions
    switch (fieldName) {
      case 'subject':
        prompt += `\nGenerate a list of 15-20 academic subject areas that would be relevant for lesson planning.`;
        break;
      case 'gradeLevel':
        prompt += `\nGenerate a comprehensive list of grade levels from early education through higher education.`;
        break;
      case 'duration':
        prompt += `\nGenerate a list of common lesson durations.`;
        break;
      case 'teachingMethods':
        prompt += `\nGenerate a list of 8-10 teaching methods that would be appropriate for ${subject || 'any subject'} at the ${gradeLevel || 'school'} level.`;
        if (specificTopic) prompt += ` Consider methods that would work well for teaching "${specificTopic}".`;
        break;
      case 'studentCharacteristics':
        prompt += `\nGenerate a list of 8-10 student characteristics or demographics that teachers might need to consider when planning lessons.`;
        break;
      case 'assessmentMethods':
        prompt += `\nGenerate a list of 8-10 assessment methods that would be appropriate for ${subject || 'any subject'} at the ${gradeLevel || 'school'} level.`;
        if (specificTopic) prompt += ` Consider assessment methods that would work well for evaluating learning about "${specificTopic}".`;
        break;
      default:
        prompt += `\nGenerate a list of 5-8 relevant options for this field in the context of lesson planning.`;
    }
    
    // Request format
    prompt += `\n\nFormat the response as a JSON array of strings. Each string should be a single choice option.`;
    
    // Add instruction for optional free text
    prompt += `\nInclude an "Other" option as the last choice to allow for custom input.`;
    
    const response = await this.makeRequest(prompt);
    
    try {
      const choices = JSON.parse(response);
      // Ensure "Other" is included as the last option
      if (!choices.includes("Other")) {
        choices.push("Other");
      }
      return choices;
    } catch (error) {
      // If parsing fails, extract choices from text
      console.warn('Failed to parse LLM response as JSON, extracting choices from text');
      const choices = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*"|"$|^\s*-\s*|\s*$/g, '').trim())
        .filter(line => line.length > 0);
      
      // Ensure "Other" is included as the last option
      if (!choices.includes("Other")) {
        choices.push("Other");
      }
      
      return choices;
    }
  }
}

module.exports = new LLMService();
