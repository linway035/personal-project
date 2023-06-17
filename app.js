import * as dotenv from 'dotenv'
import express from 'express'
import exphbs from 'express-handlebars'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')
// app.use(express.static('public'))
// app.use(express.json())
app.use(express.urlencoded({ extended: true })) //body-parser
app.use(cookieParser())

app.use(routes)

app.listen(port, () => console.log(`App is listening on port ${port}!`))
