const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo').default;
const mongoose = require('mongoose');

require('../server/config/passport');

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  'http://localhost:3000',
  'https://expense-manager-flax-phi.vercel.app',
];

console.log("Test1");

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'expense-manager-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('../server/routes/auth'));
app.use('/api/expenses', require('../server/routes/expenses'));
app.use('/api/summary', require('../server/routes/summary'));

let isConnected = false;

console.log("Test2");
// Export synchronously so Vercel detects the handler at build time
module.exports = async (req, res) => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Test2 Mongo Db Connected");
      isConnected = true;
    }
    app(req, res);
  } catch (err) {
    console.error('[serverless]', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
