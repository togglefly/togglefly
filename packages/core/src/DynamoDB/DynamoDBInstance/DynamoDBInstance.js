import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { getMarshallDefaultConfig, getUnmarshallDefaultConfig } from '../DynamoDBUtil/DynamoDBUtil.js';

export function getDynamoInstance(options) {
  const client = new DynamoDBClient(options);
  const unmarshallConfigs = getUnmarshallDefaultConfig();
  const marshallConfigs = getMarshallDefaultConfig();
  const translateConfig = {
    marshallOptions: marshallConfigs,
    unmarshallOptions: unmarshallConfigs,
  };
  return {
    client: DynamoDBDocument.from(client, translateConfig),
    unmarshall: (data) => unmarshall(data, unmarshallConfigs),
    marshall: (data) => marshall(data, marshallConfigs),
  };
}
