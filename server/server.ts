import { createApp } from './app.ts';
import router from './routes.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.use('/api', router);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  server.close();
});
