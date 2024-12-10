const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('../config/config.secret.json').azureCosmosDB;
const databaseId = config.databaseId;

/*const databaseId = "ethereum"
const containerId = "days"*/

const options = {
      endpoint: config.endpoint,
      key: config.key,
      userAgentSuffix: 'CosmosDB_StakesSpace'
};

const client = new CosmosClient(options)

/**
 * Create the database if it does not exist
 */
async function createDatabase(cb) {
  try {
    const { database } = await client.databases.createIfNotExists({
      id: databaseId
    });
    console.log(`Created database:\n${database.id}\n`);
    cb(null, database);
  } catch (error) {
    console.error('Error creating database:', error);
    cb(error);
  }
}
  
/**
* Read the database definition
*/
async function readDatabase(cb) {
  try {
    const { resource: databaseDefinition } = await client
      .database(databaseId)
      .read()
    console.log(`Reading database:\n${databaseDefinition.id}\n`);
    cb(null, databaseDefinition);
  } catch (error) {
    console.error('Error reading database:', error);
    cb(error);
  }
}
  
/**
 * Create the container if it does not exist
 */
async function createContainer(containerId, cb) {
  const partitionKey = { kind: 'Hash', paths: ['/partitionKey'] }
  try {
    /*var containerDefinition  = {id: containerId};
    if(partitionKey) containerDefinition.partitionKey = partitionKey;*/

    const { container } = await client
      .database(databaseId)
      .containers.createIfNotExists(/* containerDefinition */
        { id: containerId, partitionKey }
      )
    console.log(`Created container:\n${containerId}\n`);
    cb(null, container);
  } catch(error) {
    console.error('Error creating container:', error);
    cb(error);
  } 
}
  
  /**
   * Read the container definition
   */
async function readContainer(containerId, cb) {
  try {
    const { resource: containerDefinition } = await client
      .database(databaseId)
      .container(containerId)
      .read()
    console.log(`Reading container:\n${containerDefinition.id}\n`)
    cb(null, containerDefinition);
  } catch(error) {
    console.error('Error reading container:', error);
    cb(error);
  } 
}
  
  /**
   * Scale a container
   * You can scale the throughput (RU/s) of your container up and down to meet the needs of the workload. Learn more: https://aka.ms/cosmos-request-units
   */
async function scaleContainer(containerId, cb) {
  try {
    const { resource: containerDefinition } = await client
      .database(databaseId)
      .container(containerId)
      .read();
  
    const { resources: offers } = await client.offers.readAll().fetchAll();
  
    const newRups = 400;
    for (var offer of offers) {
      if (containerDefinition._rid !== offer.offerResourceId) {
        continue;
      }
      offer.content.offerThroughput = newRups;
      const offerToReplace = client.offer(offer.id);
      await offerToReplace.replace(offer);
      console.log(`Updated offer to ${newRups} RU/s\n`);
      return cb(null, offer);
    }
  } catch (err) {
    if (err.code === 400) {
      console.log(`Cannot read container throughput.\n`);
      console.log(err.body.message);
      cb(err);
    } else {
      console.error('Error scaling container:', err);
      cb(err);
    }
  }
}
  
/**
 * Create family item if it does not exist
 */
async function createFamilyItem(containerId, itemBody, cb) {
  try {
    const { item } = await client
      .database(databaseId)
      .container(containerId)
      .items.upsert(itemBody)
    console.log(`Created family item with id: ${itemBody.id}\n`);
    cb(null, item);
  } catch(error) {
    console.error('Error creating family item:', error);
    cb(error);
  } 
}

/*async function upsertItem(containerId, item, cb) {
  try {
    const { container } = client.database(databaseId).container(containerId);
    const { resource: upsertedItem } = await container.items.upsert(item);
    return cb (null, upsertedItem);
  } catch (error) {
    console.error("Error upserting item:", error);
    throw cb(error);
  }
}*/

/**
* Create family items
*/
/*async function createFamilyItems(databaseId, containerId, itemsArray, cb) {
  const container = client.database(databaseId).container(containerId);

  try {
    const batch = container.items.createTransactionalBatch();

    itemsArray.forEach(item => {
      batch.create(item);
    });

    const response = await batch.execute();
    if (response.error) {
      throw new Error(response.error);
    }

    console.log(`Created ${itemsArray.length} family items`);
    cb(null, response);
  } catch (error) {
    console.error('Error creating family items:', error);
    cb(error);
  }
}*/
  
/**
 * Query the container using SQL
 */
async function queryContainer(containerId, query, partitionKey, cb) {
  try {
      /*console.log(`Querying container:\n${containerId}`)*/
    
      // query to return all children in a family
      // Including the partition key value of country in the WHERE filter results in a more efficient query
      const querySpec = {
        query: query,//'SELECT VALUE r.children FROM root r WHERE r.partitionKey = @country',
        parameters: [
          {
            name: "@partitionKey",
            value: partitionKey
          }
        ]
      }
  
      const { resources: results } = await client
        .database(databaseId)
        .container(containerId)
        .items.query(querySpec)
        .fetchAll()
      /*for (var queryResult of results) {
        let resultString = JSON.stringify(queryResult)
        //console.log(`\tQuery returned ${resultString}\n`)
      }*/
      return cb(null, results);

  } catch(error) {
    console.error('Error querying family item:', error);
    return cb(error);
  } 
}
  
/**
 * Replace the item by ID.
 */
async function replaceFamilyItem(containerId, itemBody, cb) {
  try {
    console.log(`Replacing item:\n${itemBody.id}\n`)
    // Change property 'grade'
    const { item } = await client
      .database(databaseId)
      .container(containerId)
      .item(itemBody.id, itemBody.partitionKey)
      .replace(itemBody)
      return cb(null, item);
  } catch(error) {
    console.error('Error replacing family item:', error);
    cb(error);
  } 
}

async function updateItem(containerId, partitionKey, updates, cb) {
  const container = client.database(databaseId).container(containerId);

  // load original file
  const { resource: item } = await container.item(updates.id, partitionKey).read();

  if (!item) return cb('Item not found', null);

  const originalItem = item;

  // update keys
  Object.keys(updates).forEach(key => {
      if(key !== "id" && updates[key] !== null) item[key] = updates[key];
  });

  // Save updated file
  const { resource: updatedItem } = await container.item(updates.id, partitionKey).replace(originalItem);

  return cb(null,updatedItem);
}

async function getPartitionKeys(containerId, cb) {
  const container = client.database(databaseId).container(containerId);

  const querySpec = {
      query: `SELECT c.partitionKey FROM c GROUP BY c.partitionKey`
  };

  try {
    const { resources: results } = await container.items.query(querySpec).fetchAll();
    const partitionKeys = results.map(item => item.partitionKey);
    cb(null, partitionKeys);
  } catch (error) {
    console.error('Error querying partition keys:', error);
    cb(error, null);
  }
}
  
/**
 * Delete the item by ID.
 */
async function deleteFamilyItem(containerId, itemBody, cb) {
  try {
    await client
      .database(databaseId)
      .container(containerId)
      .item(itemBody.id, itemBody.partitionKey)
      .delete(itemBody)
    console.log(`Deleted item:\n${itemBody.id}\n`)
    return cb(null, itemBody);
  } catch(error) {
    console.error('Error deleting family item:', error);
    cb(error);
  } 
}
  
/**
 * Cleanup the database and collection on completion
 */
async function cleanup() {
  try {
    await client.database(databaseId).delete();
    return cb(null);
  } catch(error) {
    console.error('Error cleaning up database', error);
    return cb(error);
  } 
}

async function renameKey(oldKeyString, newKeyString) {
  try{
    const container = client.database(databaseId).container(containerId);
    const query = `SELECT * FROM c WHERE IS_DEFINED(c.${oldKeyString})`;

    const { resources: items } = await container.items.query(query).fetchAll();
    
    for (const item of items) {
      // Set new property newKeyString
      item[newKeyString] = item[oldKeyString]; // copy value
      delete item[oldKeyString]; // remove old key
      
      await container.item(item.id).replace(item); // save back to Azure DB
    }
    console.log("Update completed!");
  } catch(error){
    console.error(error);
  }
} 

  
  /**
   * Exit the app with a prompt
   * @param {string} message - The message to display
   */
  /*
  function exit(message) {
    console.log(message)
    console.log('Press any key to exit')
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', process.exit.bind(process, 0))
  }
  
  createDatabase()
    .then(() => readDatabase())
    .then(() => createContainer("days"))
    .then(() => readContainer("days"))
    .then(() => scaleContainer("days"))
    .then(() => createFamilyItem("days", Andersen))
    .then(() => createFamilyItem("days", Wakefield))
    //            createFamilyItems
    .then(() => queryContainer("days"))
    .then(() => replaceFamilyItem("days", Andersen))
    .then(() => queryContainer("days"))
    .then(() => deleteFamilyItem("days", Andersen))
    .then(() => {
      exit(`Completed successfully`)
  })
  .catch(error => {
      exit(`Completed with error ${JSON.stringify(error)}`)
  })
  */

module.exports = {
  createDatabase,
  readDatabase,
  createContainer,
  readContainer,
  scaleContainer,
  createFamilyItem,
  //upsertItem,
  //createFamilyItems,
  queryContainer,
  replaceFamilyItem,
  updateItem,
  deleteFamilyItem,
  getPartitionKeys,
  renameKey
};