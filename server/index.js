const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");
const reportRoutes = require("./routes/reportRoutes");
const connectDB = require('./config/db');
const { loadOpenPhish } = require('./utils/openPhishLoader');


dotenv.config();
connectDB();


const app = express();


app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());

app.use('/api', urlRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/scan', scanRoutes);

app.use('/api/reports', reportRoutes); // this is added


const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("server is running");
});

loadOpenPhish();
setInterval(loadOpenPhish, 60 * 60 * 1000); // refresh every 1h

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});