const tweetHelpers = {
  joinTweetsWithImages: function (data) {
    return data.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })
  },
}
export default tweetHelpers
