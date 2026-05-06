import express from 'express';
import cors from 'cors';
import './prisma/main.ts';
import { errorMiddleware } from './middleware/errorMiddleware.ts';
import routes from './routes.ts';


const app = express();
app.use(cors(
  {
    origin: 'http://localhost:5173'
  }
));
app.use(express.json());

app.use('/api', routes);
app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
