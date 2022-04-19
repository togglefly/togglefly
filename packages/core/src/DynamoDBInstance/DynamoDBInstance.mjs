import { DynamoDBClient } from '@aws-sdk/client-dynamodb/dist-es';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb/dist-es';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb/dist-es';
import { getMarshallDefaultConfig, getUnmarshallDefaultConfig } from '../DynamoDBUtil/DynamoDBUtil.mjs';

export function getDynamoInstance(options) {
  const client = new DynamoDBClient(options);
  const unmarshallConfigs = getMarshallDefaultConfig();
  const marshallConfigs = getUnmarshallDefaultConfig();
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