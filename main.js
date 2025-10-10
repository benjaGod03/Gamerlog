//cerrar y abrir modal registro
document.getElementById('openModal').onclick = function(e) {
  e.preventDefault();
  document.getElementById('modal').style.display = 'block';
};
document.getElementById('closeModal').onclick = function() {
  document.getElementById('modal').style.display = 'none';
};
window.onclick = function(event) {
  if (event.target == document.getElementById('modal')) {
    document.getElementById('modal').style.display = 'none';
  }
};

//mostrar login
document.getElementById('showLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('showLogin').style.display = 'none';
    document.getElementById('openModal').style.display = 'none';
    document.getElementById('loginForm').style.display = 'flex';
};
document.getElementById('cancelLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('showLogin').style.display = 'inline-block';
    document.getElementById('openModal').style.display = 'inline-block';
};


document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault();
    const Usuario = document.getElementById('loginUser').value;
    const Contrasena = document.getElementById('loginPass').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Usuario, Contrasena })
    });

    if (response.ok) {
        // Login exitoso
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('showLogin').style.display = 'inline-block';
        document.getElementById('openModal').style.display = 'inline-block';
        // Aquí puedes redirigir o mostrar contenido protegido
    } else {
        // Error de login
        // Si tienes un div con id="loginError", muéstralo aquí
        // document.getElementById('loginError').style.display = 'block';
        alert("Usuario o contraseña incorrectos");
    }
};