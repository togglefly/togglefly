import { DynamoDBConfig } from './DynamoDBConfig.js';

xdescribe('DynamoDBConfig', () => {
  let table;

  beforeEach(async () => {
    table = new DynamoDBConfig('features');
    await table.createTable();
  });

  test('should create a new DynamoDB table', async () => {
    const tables = await table.listAllTables();
    expect(tables).toEqual(['features']);
  });
});
