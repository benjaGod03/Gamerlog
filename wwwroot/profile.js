document.addEventListener('DOMContentLoaded', async () => {

  const fotoPerfil = document.getElementById('fotoPerfil');
  const inputFoto = document.getElementById('inputFoto');
  const perfilUsername = document.getElementById('perfilUsername');
  const perfilBio = document.getElementById('perfilBio');
  const perfilLocation = document.getElementById('perfilLocation');

  // Cargar datos de perfil desde backend (endpoint /profile)
  try {
    const resp = await fetch('/perfil', { credentials: 'same-origin' });
    if (resp.ok) {
      const data = await resp.json();
      if (data.authenticated) {
        if (perfilUsername) perfilUsername.textContent = data.usuario || '';
        // si existe foto en BDD, usarla (campo fotoPath)
        if (data.fotoPath && fotoPerfil) {
          fotoPerfil.src = data.fotoPath;
        } else if (localStorage.getItem('fotoPerfil') && fotoPerfil) {
          fotoPerfil.src = localStorage.getItem('fotoPerfil');
        }
      } else {
        if (localStorage.getItem('fotoPerfil') && fotoPerfil) {
          fotoPerfil.src = localStorage.getItem('fotoPerfil');
        }
      }
    } else {
      console.error('Error al cargar /perfil:', resp.status, await resp.text());
    }
  } catch (e) {
    console.error('Error cargando profile:', e);
  }

  // click para seleccionar archivo
  if (fotoPerfil && inputFoto) {
    fotoPerfil.addEventListener('click', () => inputFoto.click());
  }

  // subir al backend al cambiar input
  if (inputFoto) {
    inputFoto.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Mostrar preview local inmediato
      const reader = new FileReader();
      reader.onload = (e) => {
        if (fotoPerfil) fotoPerfil.src = e.target.result;
        localStorage.setItem('fotoPerfil', e.target.result); // opcional temporal
      };
      reader.readAsDataURL(file);

      // Subir al server (incluir cookies)
      const form = new FormData();
      form.append('foto', file);

      try {
        const upload = await fetch('/foto', {
          method: 'POST',
          body: form,
          credentials: 'same-origin'
        });

        const textOrJson = await upload.text();
        let json;
        try { json = JSON.parse(textOrJson); } catch { json = null; }

        if (upload.ok) {
          const path = (json && json.path) ? json.path : null;
          if (path && fotoPerfil) {
            fotoPerfil.src = path;
            localStorage.removeItem('fotoPerfil');
          }
        } else if (upload.status === 401) {
          alert('Debes iniciar sesión para subir una foto.');
        } else {
          console.error('Error subiendo foto:', upload.status, textOrJson);
          alert('Error subiendo la foto: ' + (json?.message ?? textOrJson));
        }
      } catch (err) {
        console.error('Error de red al subir foto:', err);
        alert('No se pudo conectar al servidor.');
      }
    });
  }

  // guardar campos editables localmente (como antes)
  const camposEditables = [perfilUsername, perfilBio, perfilLocation];
  camposEditables.forEach((campo) => {
    if (!campo) return;
    campo.addEventListener('blur', () => {
      localStorage.setItem(campo.id, campo.textContent);
    });
  });

  const btnVolver = document.getElementById('btnVolver');
    
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            // Cambia 'index.html' por el nombre de tu página principal si es diferente
            window.location.href = 'index.html';
        });
    }

});