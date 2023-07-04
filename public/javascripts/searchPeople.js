document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('search-form')
    .addEventListener('submit', function (event) {
      event.preventDefault()
      const searchValue = document.getElementById('example-search-input').value
      fetch(`/search/people/api?q=${searchValue}`)
        .then(response => response.json())
        .then(data => {
          const tweetsContainer = document.getElementById('tweets-container')
          tweetsContainer.innerHTML = ''

          data.userSearchResults.forEach(user => {
            //your code
            const userHTML = `
            <div class="d-flex each-tweet" style="padding: 16px 0;width: 639px;">
              <div id="tweet-icon">
                <a href="/users/${user.id}/tweets">
                  <img src="${
                    user.avatar
                  }" alt="" width="50" height="50" class="rounded-circle" />
                </a>
              </div>
              <div id="tweet-right" style="width: 528px;">
                <div class="header" style="cursor: pointer;">
                  <a href="/users/${user.id}/profile">
                    <span style="font-size: 16px; line-height: 26px; font-weight: 700;color: #171725;">${
                      user.name
                    }</span>
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
                <form action="/followships/${user.id}" method="POST" style="display: contents;">
                  <button type="submit" class="following-btn">Following</button>
                </form>
                `
                    : `
                <form action="/followships" method="POST" style="display: contents;">
                  <input type="hidden" name="id" value="${user.id}">
                  <button type="submit" class="follow-btn">Follow</button>
                </form>
                `
                }
              </div>
            </div>
            `
            tweetsContainer.innerHTML += userHTML
          })
        })
        .catch(error => console.log(error))
    })
})
