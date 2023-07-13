dayjs.extend(dayjs_plugin_relativeTime)
dayjs.locale('zh-tw')

document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('search-form')
    .addEventListener('submit', function (event) {
      event.preventDefault()
      const searchValue = document.getElementById('example-search-input').value
      fetch(`/search/api?q=${searchValue}`)
        .then(response => response.json())
        .then(data => {
          const tweetsContainer = document.getElementById('tweets-container')
          tweetsContainer.innerHTML = ''

          data.tweets.forEach(tweet => {
            const tweetHTML = `
          <div class="d-flex each-tweet" style="padding: 16px 0;width: 639px;">
            <div id="tweet-icon">
              <a href="/users/${tweet.user_id}/profile">
                <img src="${
                  tweet.avatar
                }" alt="" width="50" height="50" class="rounded-circle" />
              </a>
            </div>
            <div id="tweet-right" style="width: 528px;">
              <div class="header" onclick="window.open('/tweets/${
                tweet.id
              }/replies','_self');" style="cursor: pointer;">
                <a href="/users/${tweet.user_id}/profile">
                  <span style="font-size: 16px; line-height: 26px; font-weight: 700;color: #171725;">${
                    tweet.name
                  }</span>
                </a>
                <span style="font-size: 14px; line-height: 22px; font-weight: 400;color: #6C757D;" class="text-muted">．${dayjs(
                  tweet.updated_at
                ).fromNow()} 
                </span>
              </div>
              <div class="content-word" onclick="window.open('/tweets/${
                tweet.id
              }/replies','_self');" style="cursor: pointer;">
                ${tweet.content}
                <div class="image-container images-${tweet.images.length}">
                  ${tweet.images
                    .map(
                      image =>
                        `<img src="${image}" alt="Image" class="image-item">`
                    )
                    .join('')}
                </div>
              </div>
            </div>
          </div>
        `
            tweetsContainer.innerHTML += tweetHTML
          })
        })
        .catch(error => console.log(error))
    })
})

function likeTweet(event, tweetId) {
  event.preventDefault()
  fetch(`/tweets/${tweetId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tweetId: tweetId }),
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

function unlikeTweet(event, tweetId) {
  event.preventDefault()
  fetch(`/tweets/${tweetId}/unlike`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tweetId: tweetId }),
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
