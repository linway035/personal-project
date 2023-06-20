const ratings = {
  Alex: [4, 2, null, 5, 4],
  Bob: [5, 3, 4, null, 3],
  Tom: [3, null, 4, 4, 3],
}
console.table(Object.values(ratings))

// Step 1: Calculate similarity between Alex and all other users
const calculateSimilarity = (user1, user2) => {
  const commonIndices = Object.keys(ratings[user1]).filter(
    index => ratings[user1][index] !== null && ratings[user2][index] !== null
  )
  // console.log('commonIndices', commonIndices)

  const numerator = commonIndices.reduce(
    (sum, index) => sum + ratings[user1][index] * ratings[user2][index],
    0
  )
  const denominatorUser1 = Math.sqrt(
    commonIndices.reduce(
      (sum, index) => sum + Math.pow(ratings[user1][index], 2),
      0
    )
  )
  const denominatorUser2 = Math.sqrt(
    commonIndices.reduce(
      (sum, index) => sum + Math.pow(ratings[user2][index], 2),
      0
    )
  )
  return numerator / (denominatorUser1 * denominatorUser2)
}

// Step 2: Predict the ratings of movies that are rated by Alex
const predictRatings = (user, otherUsers) => {
  const k =
    1 /
    otherUsers.reduce(
      (sum, otherUser) => sum + calculateSimilarity(user, otherUser),
      0
    )
  console.log('k', k)

  const predictedRatings = []
  for (let i = 0; i < ratings[user].length; i++) {
    if (ratings[user][i] === null) {
      let similarityWeightedSum = 0
      for (let j = 0; j < otherUsers.length; j++) {
        const similarity = calculateSimilarity(user, otherUsers[j])
        if (similarity !== 0 && ratings[otherUsers[j]][i] !== null) {
          similarityWeightedSum += similarity * ratings[otherUsers[j]][i]
        }
      }
      predictedRatings.push(k * similarityWeightedSum)
    } else {
      predictedRatings.push(ratings[user][i])
    }
  }
  return predictedRatings
}

// Step 3: Select top rated movies
const selectTopRatedMovies = (user, predictedRatings) => {
  const topRatedMovies = []
  const movieIndices = Object.keys(ratings[user])
  movieIndices.forEach(index => {
    const movieRating = {
      movie: `Movie ${parseInt(index) + 1}`,
      rating:
        ratings[user][index] !== null
          ? ratings[user][index]
          : predictedRatings[index],
    }
    topRatedMovies.push(movieRating)
  })
  topRatedMovies.sort((a, b) => b.rating - a.rating)
  console.log(
    'hi',
    topRatedMovies.map(movie => movie.movie)
  )
  return topRatedMovies.map(movie => movie.movie)
  // return topRatedMovies.slice(0, 2).map(movie => movie.movie)
}

// Execute the steps for Alex
const similarityAlexBob = calculateSimilarity('Alex', 'Bob')
const similarityAlexTom = calculateSimilarity('Alex', 'Tom')

const predictedRatingsAlex = predictRatings('Alex', ['Bob', 'Tom'])
const topRatedMoviesAlex = selectTopRatedMovies('Alex', predictedRatingsAlex)

console.log('Similarity between Alex and Bob:', similarityAlexBob)
console.log('Similarity between Alex and Tom:', similarityAlexTom)
console.log('Predicted ratings for Alex:', predictedRatingsAlex)
console.log('Top rated movies for Alex:', topRatedMoviesAlex)
