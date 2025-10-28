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
            
            window.location.href = 'index.html';
        });
    }

    initializeAllScrollLists();
    await fetchAndDisplayBacklog();
    await fetchAndDisplayPlayed();
});

async function fetchAndDisplayBacklog() {
    try {
        const gameList = await getBacklogFromAPI();
        console.log("Backlog recibido:", gameList);
        displayBacklog(gameList);
    } catch (error) {
        // Muestra un error si el fetch falla
        const listContainer = document.getElementById('backlogListContainer');
        if (listContainer) {
            listContainer.innerHTML = '<li>Could not load your backlog.</li>';
        }
    }
}

//SI NO ANDA BORRALO
async function getBacklogFromAPI() {
    console.log("Pidiendo backlog al backend...");
    try {
        //cambia esto no se como es el get(?
        const response = await fetch('/backlog', { credentials: 'same-origin' }); 

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        // Asume que el backend devuelve { success: true, data: [juego1, juego2] }
        return data

    } catch (error) {
        console.error("Error en getBacklogFromAPI:", error);
        throw error;
    }
}

async function displayBacklog(gameList) {
    const listContainer = document.getElementById('backlogListContainer');
    
    if (!listContainer) {
        console.warn("No se encontró el elemento #backlogListContainer en profile.html");
        return;
    }

    listContainer.innerHTML = ''; // Limpia el "Cargando..."
    if (!gameList || gameList.length === 0) {
        listContainer.innerHTML = '<li>Your backlog is empty.</li>';
        return;
    }

    
    for (const gameId of gameList) {
        
        
        try {
            
            const response = await fetch(`/game?id=${encodeURIComponent(gameId)}`); 
            
            if (!response.ok) throw new Error('No se encontraron detalles');

            const gamedet = await response.json(); 

            // Crea el elemento <li>
            const gameItem = document.createElement('li');
            gameItem.className = 'games';
             // Usa el nombre de los detalles
            gameItem.innerHTML = `
                    <img src="${gamedet.background_image || 'images/img.jpeg'}" alt="${gamedet.name}" class="game-image">
                    <div class="stats">
                        <span>✰ ${gamedet.PromCalificacion}</span>
                        <span>💬 ${gamedet.CantidadResenas || 0}</span>
                    </div>
                    <div class="game-title">${gamedet.name}</div>
                `;
            listContainer.appendChild(gameItem);

        } catch (error) {
            console.error(`Error al obtener detalles del juego ${gameId}:`, error);
            // Opcional: añade un item de error
            const errorItem = document.createElement('li');
            errorItem.textContent = `Error al cargar juego ${gameId}`;
            errorItem.className = 'games';
            listContainer.appendChild(errorItem);
        }
    }
    
}

function initializeAllScrollLists() {  
    const allWrappers = document.querySelectorAll('.list-wrapper');

    allWrappers.forEach(wrapper => {
        const listElement = wrapper.querySelector('.list ul'); // Busca el <ul> dentro de .list
        const scrollLeftBtn = wrapper.querySelector('.scroll-btn.left');
        const scrollRightBtn = wrapper.querySelector('.scroll-btn.right');

        if (listElement && scrollLeftBtn && scrollRightBtn) {
            
            const scrollAmount = 280 + 15; 

            scrollRightBtn.addEventListener('click', () => {
                listElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            scrollLeftBtn.addEventListener('click', () => {
                listElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

        } else {
            console.warn("Se encontró un .list-wrapper pero le faltan elementos (ul, .left, o .right).");
        }
    });
}

async function displayPlayed(gameList) {
    const listContainer1 = document.getElementById('playedListContainer');
    
    if (!listContainer1) {
        console.warn("No se encontró el elemento #backlogListContainer en profile.html");
        return;
    }

    listContainer1.innerHTML = ''; // Limpia el "Cargando..."
    if (!gameList || gameList.length === 0) {
        listContainer1.innerHTML = '<li>Your backlog is empty.</li>';
        return;
    }

    
    for (const gameId of gameList) {
        
        
        try {
            
            const response = await fetch(`/game?id=${encodeURIComponent(gameId)}`); 
            
            if (!response.ok) throw new Error('No se encontraron detalles');

            const gamedet = await response.json(); 

            // Crea el elemento <li>
            const gameItem = document.createElement('li');
            gameItem.className = 'games';
            gameItem.textContent = gamedet.name; // Usa el nombre de los detalles
            
            gameItem.innerHTML = `
                    <img src="${gamedet.background_image || 'images/img.jpeg'}" alt="${gamedet.name}" class="game-image">
                    <div class="stats">
                        <span>✰ ${gamedet.PromCalificacion}</span>
                        <span>💬 ${gamedet.CantidadResenas || 0}</span>
                    </div>
                    <div class="game-title">${gamedet.name}</div>
                `;
            listContainer1.appendChild(gameItem);

        } catch (error) {
            console.error(`Error al obtener detalles del juego ${gameId}:`, error);
            // Opcional: añade un item de error
            const errorItem = document.createElement('li');
            errorItem.textContent = `Error al cargar juego ${gameId}`;
            errorItem.className = 'games';
            listContainer1.appendChild(errorItem);
        }
    }
    
}

async function fetchAndDisplayPlayed(){
  try {
        const gameList = await getPlayedFromAPI();
        console.log("Backlog recibido:", gameList);
        displayPlayed(gameList);
    } catch (error) {
        // Muestra un error si el fetch falla
        const listContainer = document.getElementById('backlogListContainer');
        if (listContainer) {
            listContainer.innerHTML = '<li>Could not load your backlog.</li>';
        }
    }
    
}

async function getPlayedFromAPI() {
    console.log("Pidiendo backlog al backend...");
    try {
        //cambia esto no se como es el get(?
        const response = await fetch('/played', { credentials: 'same-origin' }); 

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        // Asume que el backend devuelve { success: true, data: [juego1, juego2] }
        return data

    } catch (error) {
        console.error("Error en getBacklogFromAPI:", error);
        throw error;
    }
}