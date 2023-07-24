import fs from 'fs'
import crypto from 'crypto'

const randomImageName = () => crypto.randomBytes(8).toString('hex')
const localFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const fileName = randomImageName()
    // const AWS_CDN = process.env.AWS_CDN
    // console.log(AWS_CDN)
    console.log('fileName', fileName)
    fs.promises
      .readFile(file.path)
      .then(data => fs.promises.writeFile(`uploads/${fileName}`, data))
      .then(() => resolve(`uploads/${fileName}`))
      // .then(() => resolve(`${AWS_CDN}/${fileName}`))
      .catch(err => reject(err))
  })
}

export { localFileHandler }
