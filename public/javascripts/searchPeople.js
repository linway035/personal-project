document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form')
  const searchInput = document.getElementById('example-search-input')

  const handleSearch = function (event) {
    event.preventDefault()
    const searchValue = searchInput.value
    fetch(`/search/people/api?q=${searchValue}`)
      .then(response => response.json())
      .then(data => {
        const tweetsContainer = document.getElementById('tweets-container')
        tweetsContainer.innerHTML = ''

        data.userSearchResults.forEach(user => {
          const userHTML = `
            <div class="d-flex each-tweet" style="padding: 16px 0;width: 639px;">
              <div id="tweet-icon">
                <a href="/users/${user.id}/profile">
                  <img src="${
                    user.avatar
                  }" alt="" width="50" height="50" class="rounded-circle" />
                </a>
              </div>
              <div id="tweet-right" style="width: 528px;">
                <div class="header" style="cursor: pointer;">
                  <a href="/users/${user.id}/profile">
                    <span style="font-size: 16px; line-height: 26px; font-weight: 700;color: #171725;">
                      ${user.name}
                    </span>
                  </a>
                </div>
                <div class="content-word">
                  ${user.bio}
                </div>
              </div>
              <div style="margin-right: 15px;">
                ${
                  user.is_current_user
                    ? ''
                    : user.is_following
                    ? `
                      <button class="following-btn" data-user-id="${user.id}" onclick="unfollowUser(${user.id})">Following</button>
                    `
                    : `
                      <button class="follow-btn" data-user-id="${user.id}" onclick="followUser(${user.id})">Follow</button>
                    `
                }
              </div>
            </div>
          `
          tweetsContainer.innerHTML += userHTML
        })
      })
      .catch(error => console.log(error))
  }

  searchForm.addEventListener('submit', handleSearch)
  searchInput.addEventListener('input', handleSearch)
})
