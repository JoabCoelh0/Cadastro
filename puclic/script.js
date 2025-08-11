const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.classList.remove('error');
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        messageDiv.textContent = json.message;
        messageDiv.classList.remove('error');
        registerForm.reset();
      } else {
        messageDiv.textContent = json.error || 'Erro no cadastro';
        messageDiv.classList.add('error');
      }
    } catch (err) {
      messageDiv.textContent = 'Erro na comunicação com o servidor';
      messageDiv.classList.add('error');
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.classList.remove('error');
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        messageDiv.textContent = json.message;
        messageDiv.classList.remove('error');
        loginForm.reset();
      } else {
        messageDiv.textContent = json.error || 'Erro no login';
        messageDiv.classList.add('error');
      }
    } catch (err) {
      messageDiv.textContent = 'Erro na comunicação com o servidor';
      messageDiv.classList.add('error');
    }
  });
}
