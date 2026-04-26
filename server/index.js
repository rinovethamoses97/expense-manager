const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo').default;
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const expensesRouter = require('./routes/expenses');
const summaryRouter = require('./routes/summary');
const authRouter = require('./routes/auth');
// Fix Node.js DNS resolution for MongoDB Atlas SRV records
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '1.0.0.1',]);

dotenv.config();
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'expense-manager-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/authe', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/summary', summaryRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
