import { getDynamoInstance } from './DynamoDBInstance.js';

xdescribe('DynamoDBInstance', () => {
  let instance;

  beforeEach(() => {
    instance = getDynamoInstance();
  });

  test.todo('should return unmarshall');
  test.todo('should return client');
  test.todo('should return marshall');
});
