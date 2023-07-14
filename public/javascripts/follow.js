async function followUser(userId) {
  try {
    const response = await fetch('/followships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
      }),
    })
    if (response.ok) {
      const data = await response.json()
      console.log(data.message)
      const followBtn = document.querySelector(
        `.follow-btn[data-user-id="${userId}"]`
      )
      if (followBtn) {
        followBtn.innerHTML = 'Following'
        followBtn.setAttribute('onclick', `unfollowUser(${userId})`)
        followBtn.setAttribute('class', 'following-btn')
      }
    } else {
      console.log('Follow request failed')
    }
  } catch (error) {
    console.log(error)
  }
}

async function unfollowUser(userId) {
  try {
    const response = await fetch(`/followships/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      console.log(data.message)
      const followingBtn = document.querySelector(
        `.following-btn[data-user-id="${userId}"]`
      )
      if (followingBtn) {
        followingBtn.innerHTML = 'Follow'
        followingBtn.setAttribute('onclick', `followUser(${userId})`)
        followingBtn.setAttribute('class', 'follow-btn')
      }
    } else {
      console.log('Unfollow request failed')
    }
  } catch (error) {
    console.log(error)
  }
}
