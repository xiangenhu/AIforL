const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
