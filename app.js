import * as dotenv from 'dotenv'
import express from 'express'
import exphbs from 'express-handlebars'
import routes from './routes/index.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(routes)

app.listen(port, () => console.log(`App is listening on port ${port}!`))
