/**
 * CAR Framework Enhanced Application
 * AI-Assisted Language Learning Platform
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import modules
const projectApi = require('./modules/projects/projectApi');
const { lrsClient } = require('./modules/xapi/lrsClient');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock authentication middleware (replace with real auth)
app.use((req, res, next) => {
  req.user = {
    id: 'demo_learner',
    name: 'Demo Learner',
    role: 'learner'
  };
  next();
});

// API Routes
app.use('/api', projectApi);

// Role-based dashboard routes
app.get('/dashboard', (req, res) => {
  const role = req.user?.role || 'learner';
  res.sendFile(path.join(__dirname, 'public', 'car-dashboard.html'));
});

// ILO progress endpoint
app.get('/api/ilo-progress', async (req, res) => {
  try {
    const actor = {
      account: { name: req.user.id, homePage: 'http://aiforl.edu' },
      name: req.user.name
    };
    
    const progress = await lrsClient.getILOProgress(actor);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('ILO progress error:', error);
    res.status(500).json({ error: 'Failed to retrieve ILO progress' });
  }
});

// AI tool recommendations endpoint
app.get('/api/ai-tools/recommended', (req, res) => {
  const { proficiency, purpose } = req.query;
  
  // Simple recommendation logic (enhance with real algorithm)
  const tools = {
    beginner: ['elsaSpeak', 'talkPalAI'],
    intermediate: ['talkPalAI', 'doubao'],
    advanced: ['doubao', 'talkPalAI', 'elsaSpeak']
  };
  
  res.json({
    success: true,
    recommendations: tools[proficiency] || tools.intermediate,
    purpose: purpose || 'general'
  });
});

// Prompt engineering endpoint
app.post('/api/prompt/test', async (req, res) => {
  try {
    const { prompt, technique } = req.body;
    
    // Track prompt engineering activity
    const xapiBuilder = require('./modules/xapi/statements');
    const builder = new xapiBuilder({ endpoint: process.env.LRS_ENDPOINT });
    
    const statement = builder.createPromptStatement(
      req.user,
      prompt,
      0, // refinements count
      8  // effectiveness score (mock)
    );
    
    await lrsClient.sendStatement(statement);
    
    // Return mock response (integrate with real LLM)
    res.json({
      success: true,
      response: 'This is where the AI response would appear...',
      technique: technique || 'standard'
    });
  } catch (error) {
    console.error('Prompt test error:', error);
    res.status(500).json({ error: 'Failed to test prompt' });
  }
});

// Initialize LRS on startup
app.listen(PORT, async () => {
  console.log(`CAR Framework Platform running on http://localhost:${PORT}`);
  
  // Initialize sample data if needed
  if (process.env.INIT_SAMPLE_DATA === 'true') {
    try {
      await lrsClient.initializeSampleData();
      console.log('Sample data initialized in LRS');
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;