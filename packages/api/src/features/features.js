import { handlerSuccess, handlerError } from '../utils/api.utils.js';
import { entityInstance } from '../entity/entityInstance.js';
import log from 'loglevel';

log.setLevel('info');

export async function createFeatureHandler(event) {
  log.info('Executing createFeatureHandler function');
  const featureDTO = JSON.parse(event.body);
  log.debug({ featureDTO })
  const entity = await entityInstance();
  const featureInstance = entity.getIntance();
  log.info('Executing insert in createFeatureHandler');
  return featureInstance
    .insert(featureDTO)
    .then(handlerSuccess(event))
    .catch(handlerError(event))
}

export async function listAllFeaturesHandler(event) {
  log.info('Executing createFeatureHandler function');
  const entity = await entityInstance();
  const featureInstance = entity.getIntance();
  return featureInstance
    .list()
    .then(handlerSuccess(event))
    .catch(handlerError(event))
}

export async function updateFeatureHandler(event) {
  const id = event.pathParameters.id;
  if(!id) {
    return {
      statusCode: 502,
      body: {
        message: 'You should send an ID',
      }
    }
  }
  let { body } = event;
  if(!body) {
    return {
      statusCode: 502,
      body: {
        message: 'You should provide an body',
      }
    }
  }

  body = JSON.parse(body);
  const objectDocument = {...body, id};

  log.info('Executing updateFeatureHandle function');
  const entity = await entityInstance();
  const featureInstance = entity.getIntance();
  return featureInstance
    .update(objectDocument)
    .then(handlerSuccess(event))
    .catch(handlerError(event))
}

export async function deleteFeatureHandler(event) {
  const id = event.pathParameters.id;
  if(!id) {
    return {
      statusCode: 502,
      body: {
        message: 'You should send an ID',
      }
    }
  }
  log.info('Executing deleteFeatureHandler function');
  const entity = await entityInstance();
  const featureInstance = entity.getIntance();
  return featureInstance
    .remove({ id })
    .then(handlerSuccess(event))
    .catch(handlerError(event))
}

export async function getFeatureHandler(event) {
  const id = event.pathParameters.id;
  if(!id) {
    return {
      statusCode: 502,
      body: {
        message: 'You should send an ID',
      }
    }
  }
  log.info('Executing getFeature function');
  const entity = await entityInstance();
  const featureInstance = entity.getIntance();
  return featureInstance
    .search({ id })
    .then(handlerSuccess(event))
    .catch(handlerError(event))
}

// listAllFeaturesHandler().then(console.log);
// createFeatureHandler({ body: '{"name": "Feature 1", "description": "Feature 1 description"}' }).then(console.log);
// getFeature({params: {id: 'bla'}}).then(console.log);
