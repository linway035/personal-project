const signupForm = document.getElementById('signup-form')
const errorAlert = document.getElementById('error-alert')

signupForm.addEventListener('submit', function (e) {
  e.preventDefault()

  const name = document.getElementById('name').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const checkPassword = document.getElementById('checkPassword').value
  if (!name || !email || !password || !checkPassword) {
    errorAlert.innerHTML = `
          <strong>All required</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `
    errorAlert.classList.remove('d-none')
    return
  }
  if (name && email && password && checkPassword) {
    if (password !== checkPassword) {
      errorAlert.innerHTML = `
          <strong>密碼和確認密碼不一致!</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `
      errorAlert.classList.remove('d-none')
      return
    }

    fetch('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, checkPassword }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('name', data.name)
        localStorage.setItem('avatar', data.avatar)
        window.location.href = '/'
      })
      .catch(error => {
        console.error(error)
        errorAlert.innerHTML = `
          <strong>${error}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `
        errorAlert.classList.remove('d-none')
      })
  }
})
