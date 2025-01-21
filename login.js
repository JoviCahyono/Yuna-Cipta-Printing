const { ipcRenderer } = require('electron');

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Cek username dan password (misalnya menggunakan data statis atau verifikasi ke server)
  if (username === "admin" && password === "admin") {
    // Kirim pesan ke main process untuk membuka index.html
    ipcRenderer.send('login-success');
  } else {
    alert("Username atau password salah!");
  }
});