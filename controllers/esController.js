import * as es from '../es/es.js'
const esController = {
  api: async (req, res, next) => {
    const q = ['black']
    const dataa = await es.searchByElastic(q)
    res.json(dataa)
  },
}

export default esController
