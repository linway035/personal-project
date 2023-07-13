const ratings = {
  Alex: [4, 2, null, 5, 4],
  Bob: [5, 3, 4, null, 3],
  Tom: [3, null, 4, 4, 3],
}
// console.table(Object.values(ratings))
const followings = {
  Alex: ['Bob', 'Tom'],
  Bob: ['Tom', 'Alex'],
  Tom: ['Alex', 'Bob'],
}

// Step 1: Calculate similarity between users considering followings
const calculateSimilarity = (user1, user2, ratings, followings) => {
  const commonIndices = Object.keys(ratings[user1]).filter(
    index => ratings[user1][index] !== null && ratings[user2][index] !== null
  )

  if (commonIndices.length === 0) {
    return 0
  }

  let numerator = 0
  let denominatorUser1 = 0
  let denominatorUser2 = 0

  for (const index of commonIndices) {
    const rating1 = ratings[user1][index]
    const rating2 = ratings[user2][index]
    const followingUsers = followings[user1]

    let similarity = 1

    if (followingUsers && followingUsers.includes(user2)) {
      // Increase similarity if user1 follows user2
      similarity += 1
    }

    numerator += similarity * rating1 * rating2
    denominatorUser1 += similarity * Math.pow(rating1, 2)
    denominatorUser2 += similarity * Math.pow(rating2, 2)
  }

  const similarity =
    numerator / (Math.sqrt(denominatorUser1) * Math.sqrt(denominatorUser2))
  return similarity
}

// Step 2: Predict the ratings of movies for a user considering followings
const predictRatings = (user, otherUsers, ratings, followings) => {
  const k =
    1 /
    otherUsers.reduce(
      (sum, otherUser) =>
        sum + calculateSimilarity(user, otherUser, ratings, followings),
      0
    )

  const predictedRatings = []

  for (let i = 0; i < ratings[user].length; i++) {
    if (ratings[user][i] === null) {
      let similarityWeightedSum = 0

      for (let j = 0; j < otherUsers.length; j++) {
        const otherUser = otherUsers[j]
        const similarity = calculateSimilarity(
          user,
          otherUser,
          ratings,
          followings
        )

        if (similarity !== 0 && ratings[otherUser][i] !== null) {
          similarityWeightedSum += similarity * ratings[otherUser][i]
        }
      }

      predictedRatings.push(k * similarityWeightedSum)
    } else {
      predictedRatings.push(ratings[user][i])
    }
  }

  return predictedRatings
}

// Execute the steps for Alex
const otherUsers = Object.keys(ratings).filter(user => user !== 'Alex')
const predictedRatingsAlex = predictRatings(
  'Alex',
  otherUsers,
  ratings,
  followings
)

console.log('Predicted ratings for Alex:', predictedRatingsAlex)
