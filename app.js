import * as dotenv from 'dotenv'
import express from 'express'
import exphbs from 'express-handlebars'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')

app.listen(port, () => console.log(`App is listening on port ${port}!`))
