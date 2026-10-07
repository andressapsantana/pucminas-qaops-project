const { faker } = require('@faker-js/faker');

// Simulação de banco de dados e repositório
class TestDatabase {
  constructor() {
    this.users = new Map();
  }

  async connect() {
    // Conexão fictícia com o banco de testes
  }

  async clear() {
    this.users.clear();
  }

  async createUser(userData) {
    if (Array.from(this.users.values()).some(u => u.email === userData.email)) {
      throw new Error('Colisão de e-mail no banco de dados!');
    }
    const id = faker.string.uuid();
    const user = { id, ...userData };
    this.users.set(id, user);
    return user;
  }
}

describe('Testes de Integração - Mitigação de Estado Concorrente', () => {
  let db;

  beforeAll(async () => {
    db = new TestDatabase();
    await db.connect();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.clear();
  });

  test('Deve criar um usuário com massa de dados dinâmica sem colisão em execuções concorrentes', async () => {
    const fakeUserData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'QA_ENGINEER',
      createdAt: new Date().toISOString()
    };

    const createdUser = await db.createUser(fakeUserData);

    expect(createdUser).toHaveProperty('id');
    expect(createdUser.email).toBe(fakeUserData.email);
  });

  test('Deve isolar transações garantindo que dados de um teste não vazem para outro', async () => {
    const fakeUserData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'DEVELOPER',
      createdAt: new Date().toISOString()
    };

    await db.createUser(fakeUserData);
    expect(db.users.size).toBe(1);
  });
});
