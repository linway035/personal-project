import multer from 'multer'

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('only image'), false)
  }
}

const upload = multer({
  dest: 'uploads/',
  fileFilter: imageFilter,
})

export default upload
