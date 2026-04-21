import app from './config/app';
import { env } from './config/env';
import { getDb } from './config/database';

async function bootstrap() {
  try {
    console.log('Inicializando HackBurger API...');

    getDb();
    console.log('Banco de dados (SQLite) conectado e migrations verificadas.');

    app.listen(env.PORT, () => {
      console.log(`Servidor rodando na porta ${env.PORT}`);
      console.log(`  Modo: ${env.NODE_ENV}`);
      console.log(`  Docs: http://localhost:${env.PORT}/api/docs`);
      console.log(`  Métricas: http://localhost:${env.PORT}/metrics`);
    });

  } catch (error) {
    console.error('Falha ao inicializar servidor:', error);
    process.exit(1);
  }
}

bootstrap();
