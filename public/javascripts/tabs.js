function likeTweet (event, tweetId) {
  event.preventDefault()
  fetch(`/tweets/${tweetId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tweetId })
  })
    .then(response => {
      if (response.ok) {
        const likeButton = document.querySelector(
          `button[data-tweet-id="${tweetId}"]`
        )
        likeButton.innerHTML = `
          <img src="/images/icons/filled-like.png" alt="like" style="width:16px; height: 16px">
        `
        likeButton.onclick = event => unlikeTweet(event, tweetId)
        const countElement = document.querySelector(
          `span[data-tweet-id="${tweetId}"]`
        )
        const count = parseInt(countElement.textContent)
        countElement.textContent = count + 1
        console.log('Tweet liked successfully')
      } else {
        throw new Error('Failed to like tweet')
      }
    })
    .catch(error => {
      console.error('Error liking tweet:', error.message)
    })
}
function unlikeTweet (event, tweetId) {
  event.preventDefault()
  fetch(`/tweets/${tweetId}/unlike`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tweetId })
  })
    .then(response => {
      if (response.ok) {
        const unlikeButton = document.querySelector(
          `button[data-tweet-id="${tweetId}"]`
        )
        unlikeButton.innerHTML = `
          <img src="/images/icons/outlined-like.png" alt="like" style="width:16px; height: 16px">
        `
        unlikeButton.onclick = event => likeTweet(event, tweetId)
        const countElement = document.querySelector(
          `span[data-tweet-id="${tweetId}"]`
        )
        const count = parseInt(countElement.textContent)
        countElement.textContent = count - 1
        console.log('Tweet unliked successfully')
      } else {
        throw new Error('Failed to unlike tweet')
      }
    })
    .catch(error => {
      console.error('Error unliking tweet:', error.message)
    })
}
function hideTweet (event, tweetId) {
  event.preventDefault()
  fetch(`/tweets/${tweetId}/hidden`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
    .then(response => {
      if (response.ok) {
        const tweetElement = event.target.closest('.each-tweet')
        tweetElement.remove()
      } else {
        throw new Error('hidden fail')
      }
    })
    .catch(error => {
      console.error(error)
    })
}
