import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common'; // Importa ValidationPipe
import * as request from 'supertest';
// REMOVA esta importação: import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication; // Correção: Tipo INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // **IMPORTANTE:** Habilita o ValidationPipe para testes E2E se ele for usado globalmente
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // Adicionado

    await app.init();
  });

  // **IMPORTANTE:** Fecha a aplicação após todos os testes para liberar recursos
  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - should return "Hello World!"', () => { // Mais descritivo
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!'); // Confirme que seu AppController retorna isso
  });
});