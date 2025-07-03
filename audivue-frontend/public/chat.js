function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  // Show user message
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<div class="user">You: ${message}</div>`;

  // Call backend
  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  .then(res => res.json())
  .then(data => {
    chatBox.innerHTML += `<div class="bot">${data.reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = '';
  })
  .catch(err => {
    chatBox.innerHTML += `<div class="bot">Dr. Strange: Error connecting to server.</div>`;
  });
}
