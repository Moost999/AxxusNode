import express from 'express';
import cors from 'cors';
import assistantRoutes from './routes/assistantRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import setingRoutes from './routes/settingRoutes';
import protectRoutes from './routes/protectRoutes';
import { authenticate } from './middleware/auth';
import cookieParser from 'cookie-parser';
import notificationRoute from './routes/notificationRoute';
import adRoutes from './routes/adRoutes';

const app = express();
const PORT = process.env.PORT || 3001;


const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL_FRONT
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
};


app.use(cors(corsOptions)); // Set up CORS
app.use(cookieParser());
app.use(express.json());
// Configure CORS
app.options('*', cors(corsOptions));
// Middleware para enviar cabeçalhos CORS manualmente
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', `${process.env.VERCEL_API}`);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
     res.status(204).send();
      return
    }

  next();
});


app.use('/api/auth', authRoutes); // Auth routes api\login\ and api\register

app.use('/api', authenticate); // Middleware to protect routes
app.use('/api/assistants', assistantRoutes); //assistant Routes
app.use('/api/users', userRoutes); //user Routes
app.use('/api/whatsapp', whatsappRoutes); //whatsapp Routes
app.use('/api/dashboard', dashboardRoutes); //dashboard Routes
app.use('/api/protected', protectRoutes); //protected Routes
app.use('/api/settings', setingRoutes);   //setting Routes
app.use('/api/notifications', notificationRoute)  //notification Routes
app.use('/api/ads', adRoutes); //ad Routes

 // Middleware to protect routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});