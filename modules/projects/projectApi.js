/**
 * Project API Module for CAR Framework
 * Handles project CRUD operations with xAPI storage
 */

const express = require('express');
const router = express.Router();
const XAPIStatementBuilder = require('../xapi/statements');
const { sendToLRS, queryLRS } = require('../xapi/lrsClient');

// Initialize xAPI builder
const xapiBuilder = new XAPIStatementBuilder({
  endpoint: process.env.LRS_ENDPOINT,
  activityBase: 'http://aiforl.edu/activities'
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const { title, theme, language, goals } = req.body;
    const user = req.user; // From auth middleware
    const projectId = `proj_${Date.now()}`;
    
    // Create project initialization statement
    const statement = xapiBuilder.createProjectStatement(
      user,
      projectId,
      'define',
      language
    );
    
    // Add project details as extensions
    statement.object.definition.extensions = {
      ...statement.object.definition.extensions,
      'http://aiforl.edu/extensions/title': title,
      'http://aiforl.edu/extensions/theme': theme,
      'http://aiforl.edu/extensions/goals': JSON.stringify(goals)
    };
    
    // Send to LRS
    await sendToLRS(statement);
    
    res.json({
      success: true,
      projectId,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get user's projects
router.get('/projects', async (req, res) => {
  try {
    const user = req.user;
    
    // Query LRS for user's projects
    const query = {
      agent: JSON.stringify(xapiBuilder.createActor(user)),
      activity: 'http://aiforl.edu/activities/language-project',
      related_activities: true
    };
    
    const statements = await queryLRS(query);
    
    // Extract unique projects
    const projects = extractProjectsFromStatements(statements);
    
    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Project retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Update project stage
router.put('/projects/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const user = req.user;
    
    // Validate stage progression
    const validStages = ['define', 'collect', 'create', 'present'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }
    
    // Create stage progression statement
    const statement = {
      ...xapiBuilder.createProjectStatement(user, id, stage, req.body.language),
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/progressed',
        display: { 'en-US': 'progressed to' }
      }
    };
    
    await sendToLRS(statement);
    
    res.json({
      success: true,
      projectId: id,
      newStage: stage
    });
  } catch (error) {
    console.error('Stage update error:', error);
    res.status(500).json({ error: 'Failed to update project stage' });
  }
});

// Add AI tool usage to project
router.post('/projects/:id/ai-tool', async (req, res) => {
  try {
    const { id } = req.params;
    const { tool, purpose } = req.body;
    const user = req.user;
    
    const statement = xapiBuilder.createAIToolStatement(
      user,
      tool,
      purpose,
      id
    );
    
    await sendToLRS(statement);
    
    res.json({
      success: true,
      message: `AI tool usage recorded: ${tool}`
    });
  } catch (error) {
    console.error('AI tool tracking error:', error);
    res.status(500).json({ error: 'Failed to track AI tool usage' });
  }
});

// Helper function to extract projects from xAPI statements
function extractProjectsFromStatements(statements) {
  const projectMap = new Map();
  
  statements.forEach(stmt => {
    const projectId = stmt.object.definition?.extensions?.['http://aiforl.edu/extensions/project-id'];
    if (projectId && !projectMap.has(projectId)) {
      projectMap.set(projectId, {
        id: projectId,
        title: stmt.object.definition.extensions['http://aiforl.edu/extensions/title'],
        theme: stmt.object.definition.extensions['http://aiforl.edu/extensions/theme'],
        stage: stmt.object.definition.extensions['http://aiforl.edu/extensions/stage'],
        language: stmt.object.definition.extensions['http://aiforl.edu/extensions/language'],
        lastUpdated: stmt.timestamp
      });
    }
  });
  
  return Array.from(projectMap.values());
}

module.exports = router;