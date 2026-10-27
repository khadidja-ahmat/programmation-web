import { MongoClient } from 'mongodb';

process.loadEnvFile();

const DATABASE_NAME = process.env.DATABASE_NAME;
const MONGO_URL = process.env.MONGO_URL;
const COLLECTION = 'contacts';

async function printAllContacts(collection) {
  const results = await collection.find().toArray();
  for (const result of results) {
    console.log(`Contact : ${result.name} is ${result.age}`);
  }
}

async function main() {
  let client;
  try {
    console.log('Trying to connect...');
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('Successfully connected to MongoDB.');
    const contacts = client.db(DATABASE_NAME).collection(COLLECTION);
    await printAllContacts(contacts);
  } catch (e) {
    console.error(e);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main();
