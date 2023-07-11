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
  const results = await client.search({
    size: 50, //預設是10
    index: 'search-rdsproductiontest',
    body: {
      query: {
        match: {
          'content.icu': `${keywords}`,
        },
      },
    },
  })

  const data = results.hits.hits
  console.log(data)
  const tweetIds = data.map(item => {
    return parseInt(item._source.id.split('tweets_')[1])
  })
  console.log('tweetIds->', tweetIds)
  const filteredTweetIds = tweetIds.filter(id => !isNaN(id))
  return filteredTweetIds
}

export async function searchUserByElastic(keyword) {
  const results = await client.search({
    size: 20, //預設是10
    index: 'search-rdsproductiontest',
    body: {
      query: {
        bool: {
          should: [
            {
              fuzzy: {
                name: {
                  value: `${keyword}`,
                  fuzziness: 2,
                  max_expansions: 20,
                  prefix_length: 0,
                  transpositions: true,
                },
              },
            },
            {
              wildcard: {
                name: {
                  value: `*${keyword}*`,
                  case_insensitive: true,
                },
              },
            },
          ],
        },
      },
    },
  })

  const data = results.hits.hits
  console.log(data)
  const userIds = data.map(item => {
    return parseInt(item._source.id.split('users_')[1])
  })
  console.log('userIds->', userIds)
  const filteredUserIds = userIds.filter(id => !isNaN(id))
  return filteredUserIds
}
