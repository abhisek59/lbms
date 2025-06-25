import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import registerRouter from './routes/user.routes.js';
import bookRouter from './routes/book.routes.js';
import reservationRouter from './routes/reservation.routes.js';

const app = express();
 app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
 }))

app.use(express.json());
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
export default app;