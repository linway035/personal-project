import * as dotenv from 'dotenv'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { Client } from '@elastic/elasticsearch'
import { searchByElastic } from '../es/es.js'
const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)
dotenv.config()
const client = new Client({
  cloud: {
    id: process.env.cloudID,
  },
  auth: {
    username: process.env.ESusername,
    password: process.env.ESpassword,
  },
})

describe('Elasticsearch', () => {
  it('should return 33 tweets when searching for 薪資', async () => {
    const query = '薪資'
    const tweetIds = await searchByElastic(query, client)

    tweetIds.should.be.an('array')
    tweetIds.should.have.lengthOf(33)
  })
  it('should return 6 tweets when searching for 阿拓', async () => {
    const query = '阿拓'
    const tweetIds = await searchByElastic(query, client)

    tweetIds.should.be.an('array')
    tweetIds.should.have.lengthOf(6)
    expect(tweetIds).to.deep.equal([55, 58, 54, 60, 61, 49])
  })
  it('should return 3 tweets when searching for cp3', async () => {
    const query = 'cp3'
    const tweetIds = await searchByElastic(query, client)

    tweetIds.should.be.an('array')
    tweetIds.should.have.lengthOf(3)
  })
})
