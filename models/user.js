import pool from './databasePool.js'

export async function getCurrentUserData(currentUserID) {
  const [currentUser] = await pool.execute(
    `
    SELECT id, name, avatar FROM users WHERE id =?`,
    [currentUserID]
  )
  const currentUserData = currentUser[0]
  return currentUserData
}
