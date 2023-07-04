const signinForm = document.getElementById('signin-form')
const errorAlert = document.getElementById('error-alert')

signinForm.addEventListener('submit', function (e) {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  if (email && password) {
    fetch('/users/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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
          Login failed. Please check your email and password.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `
        errorAlert.classList.remove('d-none')
      })
  }
})
