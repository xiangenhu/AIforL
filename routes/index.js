const express = require('express');
const router = express.Router();
const path = require('path');

// Home page route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Questions page route
router.get('/questions', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/questions.html'));
});

// Process question answers
router.post('/questions', (req, res) => {
  const currentStep = parseInt(req.body.currentStep) || 1;
  const nextStep = currentStep + 1;
  
  // Combine previous answers with new ones
  const allAnswers = { ...req.body };
  delete allAnswers.currentStep;
  
  // If we've reached the end of the questions, generate the lesson plan
  if (nextStep > 5) {
    return res.redirect(`/result?${new URLSearchParams(allAnswers).toString()}`);
  }
  
  // Otherwise, proceed to the next question
  res.redirect(`/questions?step=${nextStep}&${new URLSearchParams(allAnswers).toString()}`);
});

// Result page route
router.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/result.html'));
});

module.exports = router;
