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
