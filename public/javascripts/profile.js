let socket = io()
const senderId = localStorage.getItem('userId')
const button = document.querySelector('#pro-mess')
let receiverId = null

button.addEventListener('click', function () {
  try {
    receiverId = button.getAttribute('data-receiverId')
    localStorage.setItem('receiverId', receiverId)
    socket.emit('check', { senderId, receiverId })
    window.location.href = '/chats'
  } catch (error) {
    console.log('checkroom error')
  }
})
