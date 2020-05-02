const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const MONGO_USER = process.env.MONGO_USER
const MONGO_PASS = process.env.MONGO_PASS
const MONGO_SERVER = process.env.MONGO_SERVER || 'mongodb'
const MONGO_PORT = process.env.MONGO_PORT || 27017
const NEWSAPI_SERVER = process.env.NEWSAPI_SERVER || 'https://newsapi.org'
const NEWSAPI_PATH = process.env.NEWSAPI_PATH || '/v2/top-headlines'
const NEWSAPI_KEY = process.env.NEWSAPI_KEY

const dbName = 'news'

const mongourl = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_SERVER}:${MONGO_PORT}`;
const newsapiurl = `${NEWSAPI_SERVER}${NEWSAPI_PATH}`;

(async function() {
  const client = new MongoClient(mongourl, {
    useUnifiedTopology: true
  })

  try {
    console.log(`Connecting to ${mongourl}`)
    await client.connect()
    console.log('Connected correctly to server')

    const db = client.db(dbName)

    console.log(`Reading ${newsapiurl}`)
    const response = await axios.get(newsapiurl, {
      headers: {
        'X-Api-Key': NEWSAPI_KEY
      },
      params: {
        'country': 'us'
      }
    })
    console.log('Inserting news to server')
    const r = await db.collection('inserts').insertOne(response.data, {
        w: 'majority',
        wtimeout: 10000,
        serializeFunctions: true,
        forceServerObjectId: true
      }
    )

    assert.equal(1, r.insertedCount)
  } catch (err) {
    console.log(err.stack)
  }

  console.log('Closing mongoDB connection')
  client.close()
  console.log('Ending')
})()
