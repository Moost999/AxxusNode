"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const assistantRoutes_1 = __importDefault(require("./routes/assistantRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const whatsappRoutes_1 = __importDefault(require("./routes/whatsappRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const protectRoutes_1 = __importDefault(require("./routes/protectRoutes"));
const auth_1 = require("./middleware/auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const notificationRoute_1 = __importDefault(require("./routes/notificationRoute"));
const adRoutes_1 = __importDefault(require("./routes/adRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://seusite.com'
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
};
app.use((0, cors_1.default)(corsOptions)); // Set up CORS
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Configure CORS
app.options('*', (0, cors_1.default)(corsOptions));
app.use('/api/auth', authRoutes_1.default); // Auth routes api\login\ and api\register
app.use('/api', auth_1.authenticate); // Middleware to protect routes
app.use('/api/assistants', assistantRoutes_1.default); //assistant Routes
app.use('/api/users', userRoutes_1.default); //user Routes
app.use('/api/whatsapp', whatsappRoutes_1.default); //whatsapp Routes
app.use('/api/dashboard', dashboardRoutes_1.default); //dashboard Routes
app.use('/api/protected', protectRoutes_1.default); //protected Routes
app.use('/api/settings', settingRoutes_1.default); //setting Routes
app.use('/api/notifications', notificationRoute_1.default); //notification Routes
app.use('/api/ads', adRoutes_1.default); //ad Routes
// Middleware to protect routes
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
