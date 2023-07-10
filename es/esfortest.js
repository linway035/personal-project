const dotenv = require('dotenv')
dotenv.config()
const { Client } = require('@elastic/elasticsearch')

const client = new Client({
  cloud: {
    id: process.env.cloudID, //兩個id都連得到
  },
  auth: {
    username: process.env.ESusername,
    password: process.env.ESpassword,
  },
})

// client
//   .info()
//   .then(response => console.log(response))
//   .catch(error => console.error(error))

async function run() {
  // Let's start by indexing some data
  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Ned Stark',
      quote: 'Winter is coming.',
    },
  })

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Daenerys Targaryen',
      quote: 'I am the blood of the dragon.',
    },
  })

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Tyrion Lannister',
      quote: 'A mind needs books like a sword needs a whetstone.',
    },
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'game-of-thrones' })
}

//會需要建立一段時間，所以直接接續read()的話會讀不到
// run().catch(console.log)

console.log('===============')
async function read() {
  const result = await client.search({
    index: 'game-of-thrones',
    query: {
      match: { quote: 'coming' },
    },
  })

  console.log(result.hits.hits.length, result.hits.hits)
}

read().catch(console.log) //錯誤時才會走到.catch(console.log)

async function deleteIndex(indexName) {
  await client.indices.delete({ index: indexName })
  console.log(`Index '${indexName}' deleted successfully.`)
}

// const indexName = 'game-of-thrones'
// deleteIndex(indexName).catch(console.log)

// async function searchByElastic(keywords) {
//   const matchData = keywords.map(ele => ({ match: { content: ele } }))
//   const data = await client.search({
//     index: 'search-wawa',
//     // index: process.env.ELASTIC_SEARCH_INDEX || 'search-chichi',
//     query: {
//       bool: {
//         must: matchData,
//       },
//     },
//   })

//   // console.log('1',data);
//   // console.log('2',data.hits.hits)

//   const checkData = elasticSearchDataSchema.parse(data)
//   const hitsArray = checkData.hits.hits
//   const articleId = hitsArray.map(item => {
//     return parseInt(item._source.id.split('articles_')[1])
//   })
//   console.log('articleId->', articleId)
//   return articleId
// }
