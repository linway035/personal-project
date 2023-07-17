fetch('/tweets/follows')
  .then(response => response.json())
  .then(data => {
    data.forEach(user => {
      const listItem = document.createElement('li')
      listItem.className =
        'list-group-item d-flex justify-content-between align-items-start'

      listItem.innerHTML = `
          <div class="user-icon">
            <a href="/users/${user.id}/profile">
              <img src="${user.avatar}" style="height: 50px;width:50px; border-radius:50%">
            </a>
          </div>
          <div class="ms-2 me-auto" style="margin-top:10px">
            <a href="/users/${user.id}/profile">
              <div class="popular-name" style="text-overflow:ellipsis; overflow:hidden;">
                ${user.name}
              </div>
            </a>
          </div>
          <div>
            <button class="follow-btn" data-user-id="${user.id}">follow</button>
          </div>
        `

      const followBtn = listItem.querySelector('.follow-btn')
      followBtn.addEventListener('click', () => {
        const userId = followBtn.getAttribute('data-user-id')
        const requestData = { id: userId }

        const isFollowing = followBtn.textContent === 'following'
        const url = isFollowing ? `/followships/${userId}` : '/followships'

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'follow') {
              followBtn.textContent = 'following'
            } else if (data.message === 'unfollow') {
              followBtn.textContent = 'follow'
            }
          })
          .catch(error => {
            console.error(error)
          })
      })

      document.querySelector('.popular-list-group').appendChild(listItem)
    })
  })
  .catch(error => {
    console.log(error)
  })
