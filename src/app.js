import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

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
export default app;