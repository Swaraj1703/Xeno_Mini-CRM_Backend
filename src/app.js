const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db.config');
const passport = require('./services/auth.service');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
connectDB();

const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development frontend
    'https://xeno-frontend-nzmg6toor-vinaygitts-projects.vercel.app', // Deployed frontend
    'https://xeno-frontend-chi.vercel.app'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow common HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
  credentials: true, // Allow cookies or headers with credentials
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Persistent session store
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    sameSite: 'none',
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/campaigns', require('./routes/campaign.routes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
