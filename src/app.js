import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import registerRouter from './routes/user.routes.js';
import bookRouter from './routes/book.routes.js';
import reservationRouter from './routes/reservation.routes.js';
// import { borrowBook } from './controllers/borrow.controller.js';
import borrowRouter from './routes/borrow.routes.js';
import fineRouter from './routes/fine.routes.js';
import categoryRouter from './routes/category.routes.js';

const app = express();
 app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
 }))

app.use(express.urlencoded
    (
        {
             extended: true 
            }
        )
        );
app.use(cookieParser());
app.use(express.json({
    limit: '16KB'
}));

app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

app.use('/api/v1/users',registerRouter);
app.use('/api/v1/books',bookRouter)
app.use('/api/v1/reservations',reservationRouter)
app.use('/api/v1/borrow', borrowRouter)
app.use('/api/v1/fine',fineRouter)
app.use('/api/v1/category',categoryRouter)
export default app;