const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');

// Load environment variables from config.env
dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT || 8000;

// Create server
const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Import routes
const portfolioRoutes = require('./routes/portfolios');
const authRoutes = require('./routes/auth');
const communicationRoutes = require('./routes/communications');
const contactRoutes = require('./routes/contacts');

// Mount routes to server
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/communications', communicationRoutes);
app.use('/api/v1/contacts', contactRoutes);

// Error handling middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`.yellow.bold);
    connectDB();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server and exit process
    server.close(() => {
        process.exit(1);
    })
})