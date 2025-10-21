document.addEventListener('DOMContentLoaded', () => {

  const fotoPerfil = document.getElementById('fotoPerfil');
  const inputFoto = document.getElementById('inputFoto');
  const perfilUsername = document.getElementById('perfilUsername');
  const perfilBio = document.getElementById('perfilBio');
  const perfilLocation = document.getElementById('perfilLocation');

  // para cambiar la foto 
  fotoPerfil.addEventListener('click', () => inputFoto.click());

  inputFoto.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // preview
    const reader = new FileReader();
    reader.onload = (e) => {
      fotoPerfil.src = e.target.result;
      // guardar en local
      localStorage.setItem('fotoPerfil', e.target.result);
    };
    reader.readAsDataURL(file);
  });

  //lo guarde localmente para probar cambialo
  const camposEditables = [perfilUsername, perfilBio, perfilLocation];
  camposEditables.forEach((campo) => {
    campo.addEventListener('blur', () => {
      localStorage.setItem(campo.id, campo.textContent);
    });
  });

  if (localStorage.getItem('fotoPerfil')) {
    fotoPerfil.src = localStorage.getItem('fotoPerfil');
  }
  if (localStorage.getItem('perfilUsername')) {
    perfilUsername.textContent = localStorage.getItem('perfilUsername');
  }
  if (localStorage.getItem('perfilBio')) {
    perfilBio.textContent = localStorage.getItem('perfilBio');
  }
  if (localStorage.getItem('perfilLocation')) {
    perfilLocation.textContent = localStorage.getItem('perfilLocation');
  }

});