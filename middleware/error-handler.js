const generalErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    req.flash('error_messages', `${err.name}: ${err.message}`)
  } else {
    req.flash('error_messages', `${err}`)
  }
  next(err)
}

export default generalErrorHandler
