import express from 'express';
import cors from 'cors';
import assistantRoutes from './routes/assistantRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import protectRoutes from './routes/protectRoutes';
import { authenticate } from './middleware/auth';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;


const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://seusite.com'
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
};


app.use(cors(corsOptions)); // Set up CORS
app.use(cookieParser());
app.use(express.json());
// Configure CORS
app.options('*', cors(corsOptions));


app.use('/api/auth', authRoutes); // Auth routes api\login\ and api\register

app.use('/api', authenticate); // Middleware to protect routes
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);

 // Middleware to protect routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});