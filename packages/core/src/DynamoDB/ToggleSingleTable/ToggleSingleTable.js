import { DynamoDBConfig, getDynamoInstance } from '../../index.js';
import {
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import {toggleDTO, systemsDTO, rolesDTO, generateSystem} from './ToggleSingleTable.utils.js';
import { v4 } from 'uuid';
import log from 'loglevel';

/**
 * @typedef ISingleTableQuery
 * @property {string} pk
 * @property {string} sk
 */

/**
 * @typedef IToggleSingleTable
 * @property {string} pk
 * @property {string} sk
 * @property {string} entityType
 * @property {string} name
 * @property {string} description
 * @property {boolean} enabled
 */

export class FeaturesSingleTableEntity extends DynamoDBConfig {
  constructor(TableName, dynamoConfigs = {}) {
    super(TableName, dynamoConfigs);
    this.prefixFeature = 'F#';
    this.prefixSystem = 'S#';
    this.prefixRole = 'R#'
  }

  /**
   * @param {string} rolePk
   * @returns {Promise<IToggle | undefined>}
   */
  #getRoleDetails(rolePk) {
    const filters = {
      pk: rolePk,
      sk: rolePk,
    };
    return this.scan(undefined, filters)
      .then(roles => roles[0]);
  }

  /**
   *
   * @param {string} systemPk
   * @returns {Promise<IToggleSingleTable | undefined>}
   */
  #getSystemDetails(systemPk) {
    const filters = {
      pk: systemPk,
      sk: systemPk,
    };
    return this.scan(undefined, filters)
      .then(roles => roles[0]);
  }

  /**
   * @private
   * @param {string} feature
   * @returns {Promise<string[]>}
   */
  async #listAllRolesOfFeature(feature) {
    log.info('Executing listRoles function.');
    const roles = await this.scan(undefined, {
      pk: feature,
      sk: this.prefixRole,
    });
    log.debug({ roles });
    log.info('Making request for role datails.');
    for await (let role of roles) {
      const roleDatails = await this.#getRoleDetails(role.sk);
      role.name = roleDatails.name;
    }
    log.debug({ roles });
    log.info('Mapping resulting of roles.');
    return roles.map(({ name }) => name);
  }

  async #deleteAllRolesOfToggle(toggle) {
    log.info('Executing deleteAllRolesOfToggle function.');
    const roles = await this.scan(undefined, {
      pk: toggle,
      sk: this.prefixRole,
    });
    log.debug({ roles });

    if(!roles.length) {
      log.info(`No roles to delete for toggle ${toggle}`);
      return;
    }


    log.info(`Deleting ${roles.length} roles`);

    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);

    for await (let role of roles) {
      log.info(`Deleting role ${role.sk} of ${toggle}`);
      const Role = marshall({
        pk: toggle,
        sk: role.sk,
      });
      const command = new DeleteItemCommand({
        TableName,
        Key: Role,
      });
      await dynamo.send(command);
    }

    return dynamo.destroy();
  }

  async #deleteAllSystemsOfToggle(toggle) {
    log.info('Executing deleteAllSystemsOfToggle function.');
    const systems = await this.scan(undefined, {
      pk: toggle,
      sk: this.prefixSystem,
    });

    if(!systems.length) {
      log.info(`No systems to delete for toggle ${toggle}`);
      return;
    }

    log.info(`Deleting ${systems.length} systems`);

    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);

    for await (let system of systems) {
      log.info(`Deleting system ${system.sk} of ${toggle}`);
      const Role = marshall({
        pk: toggle,
        sk: system.sk,
      });
      const command = new DeleteItemCommand({
        TableName,
        Key: Role,
      });
      await dynamo.send(command);
    }

    return dynamo.destroy();
  }

  /**
   * @private
   * @param {String} feature
   * @returns {Promise<String[]>}
   */
  async #listAllSystemsOfFeature(feature) {
    log.info('Executing listSystems function');
    const filters = {
      pk: feature,
      sk: this.prefixSystem,
    };
    const systems = await this.scan(undefined, filters);
    log.debug({ systems });
    for (let system of systems) {
      const systemDetails = await this.#getSystemDetails(system.sk);
      log.debug({ systemDetails });
      system.name = systemDetails.name;
    }
    log.debug({ systems });
    return systems.map(({ name }) => name);
  }

  /**
   * @param {string} lastKey
   * @param {ISingleTableQuery} filters
   * @returns {Promise<IToggleSingleTable[]>}
   */
  scan(lastKey = undefined, { pk, sk }) {
    log.info('Executing scan function');
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, unmarshall, marshall } = getDynamoInstance(connectionConfigs);
    const command = new ScanCommand({
      TableName,
      FilterExpression: 'begins_with(pk, :pk) and begins_with(sk, :sk)',
      ExpressionAttributeValues: marshall({
        ":pk": pk,
        ":sk": sk,
      }),
      // Limit: this.paginationLimit,
      ExclusiveStartKey: lastKey
        ? marshall({ id: lastKey })
        : undefined
    });
    log.info(`Executing scan with pk ${pk}`);
    log.info(`Executing scan with sk ${sk}`);
    return dynamo
      .send(command)
      .then(result => (
        result
          ? result.Items.map(item => unmarshall(item))
          : []
      ))
      .finally(() => dynamo.destroy());
  }

  /**
   * @description
   *
   * Will list all roles that are stored.
   *
   * @returns {Promise<string[]>}
   */
  listAllRoles( ) {
    const query = {
      pk: this.prefixRole,
      sk: this.prefixRole,
    };
    return this.scan(undefined, query)
      .then(result => result.map(rolesDTO));
  }

  /**
   * @description Will list all systems thar are stored
   * @returns {Promise<string[]>}
   */
  listAllSystems() {
    const query = {
      pk: this.prefixSystem,
      sk: this.prefixSystem,
    };
    return this.scan(undefined, query)
      .then(result => result.map(systemsDTO));
  }

  /**
   * @description
   * Will list all features stored for roles.
   * The roles passed as parameter will use the logic OR.
   * @param {IToggle[]} roles
   */
  listAllTogglesWithRoles(roles) {

  }

  /**
   * @description
   * Will list all features stored for systems.
   * The systems passed as parameter will use the logic OR.
   * @param {IToggle[]} systems
   */
  listAllFeaturesOfSystems(systems) {

  }

  /**
   * @description
   *
   * Return all the toggles that are stored.
   * You can pass the `lastKey` as parameter to control pagination.
   *
   * @param lastKey
   * @returns {Promise<IToggle[]>}
   */
  async list(lastKey = undefined) {
    log.info('Executing list function');
    const features = await this.scan(lastKey, {
      pk: this.prefixFeature,
      sk: this.prefixFeature,
    });
    log.debug({ features });
    log.info('Making requests of roles and systems');
    for await (let feature of features) {
      const roles = await this.#listAllRolesOfFeature(feature.pk);
      const systems = await this.#listAllSystemsOfFeature(feature.pk);
      log.debug({ roles });
      log.debug({ systems });
      feature.allowedRoles = roles;
      feature.systems = systems;
    }
    log.info('Finished requests for roles and systems');
    log.debug({ features });
    return features.map(toggleDTO);
  }

  insertRole(role) {
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);
    const id = `${this.prefixRole}${v4()}`;
    const item = {
      pk: id,
      sk: id,
      entityType: 'system',
      ...role,
    };
    const command = new PutItemCommand({
      TableName,
      Item: marshall(item),
    });
    return dynamo.send(command)
      .then(() => this.#getRoleDetails(id))
      .finally(() => dynamo.destroy());

  }

  insertSystem(system) {
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);
    const id = `${this.prefixSystem}${v4()}`;
    const item = {
      pk: id,
      sk: id,
      entityType: 'system',
      ...system,
    };
    const command = new PutItemCommand({
      TableName,
      Item: marshall(item),
    });
    return dynamo.send(command)
      .then(() => this.#getSystemDetails(id))
      .finally(() => dynamo.destroy());
  }

  /**
   *
   * @param {IToggleInsert} toggle
   * @returns {Promise<IToggle>}
   */
  insert(toggle) {
    const { name, description } = toggle;
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);
    const id = `${this.prefixFeature}${v4()}`;
    const item = {
      pk: id,
      sk: id,
      entityType: 'toggle',
      name,
      description,
      allowedRoles: toggle.allowedRoles || [],
      systems: toggle.systems || [],
      isActive: toggle.isActive || true,
    };
    const command = new PutItemCommand({
      TableName,
      Item: marshall(item),
    });
    log.info(`Trying to insert toggle ${id}`);
    return this.#insertSystemsForToggle(item)
      .then(() => this.#insertRolesForToggle(item))
      .then(() => dynamo.send(command))
      .then(() => this.getToggle(id))
      .finally(() => dynamo.destroy());
  }

  /**
   * @description Add relationship
   * @param toggle
   * @returns {Promise<void>}
   */
  async #insertRolesForToggle({ pk, allowedRoles }) {
    if(allowedRoles?.length === 0) return;
    const getItem = (role) => ({
      pk: pk,
      sk: role,
      entityType: 'role',
    });
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);
    for await (let allowedRole of allowedRoles) {
      const item = getItem(allowedRole);
      const command = new PutItemCommand({
        TableName,
        Item: marshall(item),
      });
      log.info(`Trying to insert role ${allowedRole} for toggle ${pk}`);
      await dynamo
        .send(command)
        .catch((erro) => {
          log.error(`Error in insert role ${allowedRole} for toggle ${pk}`);
          log.error(erro);
          return Promise.reject(erro);
        });
    }
  }

  /**
   *
   * @param pk
   * @param systems
   * @returns {Promise<void>}
   */
  async #insertSystemsForToggle({ pk, systems }) {
    if(systems?.length === 0) return;
    const getItem = (role) => ({
      pk: pk,
      sk: role,
      entityType: 'system',
    });
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall } = getDynamoInstance(connectionConfigs);
    for await (let system of systems) {
      const item = getItem(system);
      const command = new PutItemCommand({
        TableName,
        Item: marshall(item),
      });
      log.info(`Trying to insert system ${system} for feature ${pk}`);
      await dynamo
        .send(command)
        .catch((erro) => {
          log.error(`Error in insert system ${system} for feature ${pk}`);
          log.error(erro);
          return Promise.reject(erro);
        });
    }
  }

  search(id) {
    const { connectionConfigs, TableName } = this;
    const { client: dynamo, marshall, unmarshall } = getDynamoInstance(connectionConfigs);
    const Key = marshall({ pk: id, sk: id });
    const command = new GetItemCommand({ TableName, Key })
    return dynamo
      .send(command)
      .then((result) => (
        result.Item
          ? unmarshall(result.Item)
          : undefined
      ))
      .finally(() => dynamo.destroy());
  }

  /**
   * @param {string} id
   * @returns {Promise<IToggle>}
   */
  getToggle(id) {
    return this.search(id)
      .then(item => item && toggleDTO(item))
  }

  /**
   * @param {IToggleUpdate} toggle
   * @returns {Promise<IToggle>}
   */
  update(toggle) {
    return this.delete(toggle.id)
      .then(() => this.insert(toggle));
  }

  async delete(id) {
    log.info('Executing delete function');
    const { connectionConfigs, TableName } = this;
    const { client: dynamodb, marshall } = getDynamoInstance(connectionConfigs);
    const Key = marshall({ pk: id, sk: id });
    const command = new DeleteItemCommand({
      TableName,
      Key,
    });
    const toggle = await this.getToggle(id);
    if(toggle !== undefined) {
      log.info('Sending delete command');
      await this.#deleteAllRolesOfToggle(id);
      await this.#deleteAllSystemsOfToggle(id);
      return dynamodb
        .send(command)
        .finally(() => dynamodb.destroy());
    }
    log.info('Nothing to delete');
  }
}
