import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const expireTime = 60 * 60 * 24 * 5

export function signJWT (userId) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: expireTime },
      function (err, token) {
        if (err) {
          reject(err)
        }
        resolve(token)
      }
    )
  })
}

export function verifyJWT (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
