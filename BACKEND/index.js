import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import detailsRoutes from './routes/detailsRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";





dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow both the host browser and the container name
const allowedOrigins = [
  "http://localhost:5173",    // browser dev server on host
  "http://frontend-sih:5173"  // Vite when accessed via container network (optional)
];

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl, same-origin requests with no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS: origin not allowed"));
  },
  credentials: true, // if you use cookies/auth
}));




// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the PrepMaster API!');
});

app.use('/api', authRoutes);
app.use('/api/details', detailsRoutes);

app.use("/api/chat", chatRoutes);



app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
