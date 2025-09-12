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

app.use(cors({ origin: "http://localhost:5173", credentials: true }));



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
