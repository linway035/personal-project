function dotProduct(vectorA, vectorB) {
  let product = 0
  for (let i = 0; i < vectorA.length; i++) {
    product += vectorA[i] * vectorB[i]
  }
  return product
}

function vectorMagnitude(vector) {
  let sumOfSquares = 0
  for (let i = 0; i < vector.length; i++) {
    sumOfSquares += Math.pow(vector[i], 2)
  }
  return Math.sqrt(sumOfSquares)
}

function cosineSimilarity(vectorA, vectorB) {
  const dotProd = dotProduct(vectorA, vectorB)
  const magA = vectorMagnitude(vectorA)
  const magB = vectorMagnitude(vectorB)
  return dotProd / (magA * magB)
}

function recommendTweets(user, tweetData) {
  const userVector = tweetData[user]
  const recommendations = []
  for (const otherUser in tweetData) {
    if (otherUser !== user) {
      const otherUserVector = tweetData[otherUser]
      const similarity = cosineSimilarity(userVector, otherUserVector)
      recommendations.push({ user: otherUser, similarity: similarity })
    }
  }
  recommendations.sort((a, b) => b.similarity - a.similarity)
  return recommendations
}

const tweetData = {
  user1: [5, 2, 3, 4, 5],
  user2: [1, 2, 3, 4, 5],
  user3: [5, 4, 3, 2, 1],
  user4: [1, 1, 1, 1, 1],
}

const user = 'user1'
const recommendations = recommendTweets(user, tweetData)
console.log(recommendations)
