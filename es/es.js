import * as dotenv from 'dotenv'
dotenv.config()
import { Client } from '@elastic/elasticsearch'

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

// console.log('===============')
export async function searchByElastic(keywords) {
  const matchData = keywords.map(ele => ({ match: { content: ele } }))
  const results = await client.search({
    size: 100, //預設是10
    index: 'search-rdsproductiontest',
    body: {
      query: {
        bool: {
          must: matchData,
        },
      },
    },
  })

  const data = results.hits.hits
  const tweetId = data.map(item => {
    return parseInt(item._source.id.split('tweets_')[1])
  })
  console.log('tweetId->', tweetId)
  return tweetId
}

// read().catch(console.log) //錯誤時才會走到.catch(console.log)
