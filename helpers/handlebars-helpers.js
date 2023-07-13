import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import 'dayjs/locale/zh-tw.js'
dayjs.extend(relativeTime)
dayjs.locale('zh-tw')

const handlebarsHelpers = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  ifNotCond: function (a, b, options) {
    return a === b ? options.inverse(this) : options.fn(this)
  },
  currentYear: () => dayjs().year(),
  relativeTimeFromNow: a => dayjs(a).fromNow(),
  tweetDateTime: a => dayjs(a).format('A h:mm・YYYY年M月D日'),
}

export default handlebarsHelpers
