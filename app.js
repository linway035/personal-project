import * as dotenv from 'dotenv'
import express from 'express'
import exphbs from 'express-handlebars'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import routes from './routes/index.js'
import handlebarsHelpers from './helpers/handlebars-helpers.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET

app.engine('hbs', exphbs({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.static('public'))
// app.use(express.json())
app.use(express.urlencoded({ extended: true })) //body-parser
app.use(express.json()) //解析 application/json 格式資料，有這句postman才可以用 raw json，否則只能x-www-form-urlencoded
app.use(cookieParser())
app.use('/uploads', express.static('./uploads'))
app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
)
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

app.use(routes)

app.listen(port, () => console.log(`App is listening on port ${port}!`))
