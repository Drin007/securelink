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

const allowedOrigins = [
  'http://localhost:5173',
  'https://securelink-five.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// app.use(cors({
//   origin: true,
//   credentials: true
// }));

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