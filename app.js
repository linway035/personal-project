import * as dotenv from 'dotenv'
import express from 'express'
import exphbs from 'express-handlebars'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import routes from './routes/index.js'
import handlebarsHelpers from './helpers/handlebars-helpers.js'
import cors from 'cors'
import { socketHandler } from './socket/socketHandler.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET
const server = createServer(app)
const io = new Server(server)

socketHandler(io)
app.use(cors())

app.engine('hbs', exphbs({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) //body-parser
app.use(express.json()) //解析 application/json 格式資料，才可以用 raw json
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
app.all('*', (req, res) => {
  res.status(404).render('404')
})

server.listen(port, () => console.log(`App is listening on port ${port}!`))
