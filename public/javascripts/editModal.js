const profileModalForm = document.querySelector('#profile-modal-form')
const inputName = document.querySelector('#name')
const inputIntroduction = document.querySelector('#bio')
const inputCover = document.querySelector('#modal-cover')
const inputAvatar = document.querySelector('#modal-avatar')
const avatarBtn = document.querySelector('#avatar-btn')
const coverBtn = document.querySelector('#cover-btn')
const editButton = document.querySelector('#edit-button')

editButton.addEventListener('click', function (event) {
  const target = event.target
  const UserId = target.dataset.id

  fetch(`/users/edit/${UserId}`)
    .then(response => response.json())
    .then(data => {
      inputName.value = data.name
      inputIntroduction.value = data.bio
      inputCover.src = data.cover
      inputAvatar.src = data.avatar
    })
    .catch(err => console.log(err))
})

// 儲存modal資訊，刷新頁面
profileModalForm.addEventListener('submit', function (event) {
  event.preventDefault()
  const target = event.target
  const UserId = target.dataset.id
  const formData = new FormData()
  formData.append('name', inputName.value)
  formData.append('introduction', inputIntroduction.value)
  formData.append('cover', coverBtn.files[0])
  formData.append('avatar', avatarBtn.files[0])
  console.log(formData)

  fetch(`/users/edit/${UserId}`, {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      console.log('hi')
      if (response.ok) {
        history.go(0)
      } else {
        throw new Error('儲存失敗')
      }
    })
    .catch(err => console.log(err))
})

// 表單驗證
inputName.addEventListener('input', function (event) {
  const errName = document.querySelector('#err-name')
  const nameTotal = inputName.value.trim().length
  document.getElementById('text-count').innerHTML = nameTotal + '/50'
  if (nameTotal >= 50) {
    inputName.classList.add('disabled')
    document.getElementById('err-name').innerHTML = '字數超出上限!'
    errName.classList.remove('err-sec')
  } else if (nameTotal === 0) {
    document.getElementById('err-name').innerHTML = '名稱為必填'
    errName.classList.remove('err-sec')
  } else if (nameTotal < 50 || nameTotal >= 1) {
    inputName.classList.remove('disabled')
    errName.classList.add('err-sec')
  }
})

inputIntroduction.addEventListener('input', function (event) {
  const errIntro = document.querySelector('#err-intro')
  const introductionTotal = document
    .getElementById('introduction')
    .value.trim().length
  document.getElementById('text-count-info').innerHTML =
    introductionTotal + '/160'
  if (introductionTotal >= 160) {
    inputIntroduction.classList.add('disabled')
    errIntro.classList.remove('err-sec')
  } else {
    inputIntroduction.classList.remove('disabled')
    errIntro.classList.add('err-sec')
  }
})
