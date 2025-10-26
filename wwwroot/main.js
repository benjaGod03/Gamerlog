
function actualizarEscenario(usuario) {
    const loginBtn = document.getElementById('showLogin');
    const registerBtn = document.getElementById('registerLink');
    const userDisplay = document.getElementById('userDisplay');
     const menuOptions = document.getElementById('menuOptions');

    if (usuario) {
        // Usuario logueado
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userDisplay.style.display = 'inline-block';
        userDisplay.textContent = `👤 ${usuario}`;
    } else {
        // Usuario no logueado
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        userDisplay.style.display = 'none';
        menuOptions.classList.remove('show');
    }
}

//usuario desde back
async function fetchMeAndUpdate() {
  try {
    const resp = await fetch('/me');
    if (!resp.ok) { actualizarEscenario(null); return; }
    const data = await resp.json();
    if (data.authenticated) actualizarEscenario(data.usuario);
    else actualizarEscenario(null);
  } catch (e) {
    console.error('fetch /me failed', e);
    actualizarEscenario(null);
  }
}
async function cargarJuegos() {
    const gamesList = document.getElementById('gamesList');
    const listTitle = document.getElementById('listTitle');
    const btnVolver = document.getElementById('btnVolver');

        if (!gamesList || !listTitle || !btnVolver) {
        return; 
    }

    const searchInput = document.getElementById('searchInput');

    listTitle.textContent = "Juegos Populares"; // O tu título original
    btnVolver.style.display = 'none';           // Oculta el botón "Volver"
    searchInput.value = '';

    gamesList.innerHTML = "<p>Cargando juegos populares...</p>";

    const response = await fetch('/games?search=');
         if (response.ok) {
        const data = await response.json();
        gamesList.innerHTML = "";

        if (data.results && data.results.length > 0) {
            data.results.slice(0, 4).forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game-popular';
                gameDiv.style.cursor = 'pointer';
                gameDiv.innerHTML = `
                    <img src="${game.background_image || 'images/img.jpeg'}" alt="${game.name}" class="game-image">
                        <div class="stats">
                         <span>✰ ${game.PromCalificacion}</span>
                         <span>💬 ${game.CantidadResenas || 0}</span>
                        </div>
                    <div class="game-title">${game.name}</div>
                `;
                    gameDiv.onclick = function() {
                    localStorage.setItem('selectedGameId', game.id);
                    window.location.href = 'game.html';
                    };
                 gamesList.appendChild(gameDiv);
        });
    
         } else {
         gamesList.innerHTML = "<p>No se encontraron juegos populares.</p>";
         }
    } else {
        gamesList.innerHTML = "<p>Error al cargar juegos populares.</p>";
    }
}
async function ejecutarBusqueda(query) {
    const listTitle = document.getElementById('listTitle');
    const gamesList = document.getElementById('gamesList');
    const btnVolver = document.getElementById('btnVolver');

    // Comprobamos que estamos en la página de inicio
    if (!listTitle || !gamesList || !btnVolver) {
        console.error("ejecutarBusqueda() solo se puede ejecutar en index.html");
        return;
    }

    // Mostramos un estado de "Cargando"
    listTitle.textContent = `Buscando: "${query}"...`;
    gamesList.innerHTML = "<p>Cargando resultados...</p>";
    btnVolver.style.display = 'none'; // Ocultamos el botón "Volver"

    // Esta es la lógica que ya tenías, ahora dentro de una función
    const response = await fetch(`/games?search=${encodeURIComponent(query)}`);

    if (response.ok) {
        const data = await response.json();
        gamesList.innerHTML = ""; // Limpiamos el "Cargando..."

        if (data.results && data.results.length > 0) {
            listTitle.textContent = `Resultados para: "${query}"`;
            btnVolver.style.display = 'block';
            
            data.results.slice(0, 10).forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game-popular';
                gameDiv.style.cursor = 'pointer';
                gameDiv.innerHTML = `
                    <img src="${game.background_image || 'images/img.jpeg'}" alt="${game.name}" class="game-image">
                    <div class="stats">
                        <span>✰ ${game.PromCalificacion}</span>
                        <span>💬 ${game.CantidadResenas || 0}</span>
                    </div>
                    <div class="game-title">${game.name}</div>
                `;
                gameDiv.onclick = function() {
                    localStorage.setItem('selectedGameId', game.id);
                    window.location.href = 'game.html';
                };
                gamesList.appendChild(gameDiv);
            });
        } else {
            listTitle.textContent = `No se encontraron resultados para: "${query}"`;
            gamesList.innerHTML = "<p>Intenta con otra búsqueda.</p>";
            btnVolver.style.display = 'block';
        }
    } else {
        alert("Error al buscar juegos");
        listTitle.textContent = "Juegos Populares"; // Restaurar título en caso de error
    }
}

//mostrar login
document.getElementById('showLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('showLogin').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
    document.getElementById('loginForm').style.display = 'flex';
};
document.getElementById('cancelLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('showLogin').style.display = 'inline-block';
    document.getElementById('registerLink').style.display = 'inline-block';
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
        await fetchMeAndUpdate();
        // Login exitoso
        document.getElementById('loginForm').style.display = 'none';
        
    } else {
        // Error de login
        // Si tienes un div con id="loginError", muéstralo aquí
        // document.getElementById('loginError').style.display = 'block';
        alert("Usuario o contraseña incorrectos");
    }

};



document.getElementById('searchInput').addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query.length === 0) return;

        const isOnIndex = document.getElementById('gamesList');

        if (isOnIndex) {
            //si estas en el index se queda aca
            await ejecutarBusqueda(query);
        } else {
            // si no es redireccionamos
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
    }
});

const btnVolver = document.getElementById('btnVolver');
if (btnVolver) {
    btnVolver.addEventListener('click', function() {
        cargarJuegos(); 
    });
}


window.addEventListener('DOMContentLoaded', async function() {
    await fetchMeAndUpdate();
   const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery; 
        await ejecutarBusqueda(searchQuery);
    } else {
        await cargarJuegos();
    }
    await cargarGamesSec();
});

async function cargarGamesSec() {
const gamesList = document.getElementById('games-sec');
    if (!gamesList) return;
    gamesList.innerHTML = "<p>Cargando juegos populares...</p>";

    const response = await fetch('/games?search=');
    if (response.ok) {
        const data = await response.json();
        gamesList.innerHTML = "";

        if (data.results && data.results.length > 0) {
            
            data.results.slice(5, 20).forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'games';
                gameDiv.style.cursor = 'pointer';
                gameDiv.innerHTML = `
                    <img src="${game.background_image || 'images/img.jpeg'}" alt="${game.name}" class="game-image">
                    <div class="stats">
                        <span>✰ ${game.PromCalificacion}</span>
                        <span>💬 ${game.CantidadResenas || 0}</span>
                    </div>
                    <div class="game-title">${game.name}</div>
                `;
                // Al hacer clic, guarda el ID en localStorage y redirige
                gameDiv.onclick = function() {
                    localStorage.setItem('selectedGameId', game.id);
                    window.location.href = 'game.html';
                };
                gamesList.appendChild(gameDiv);
            });
        } else {
            gamesList.innerHTML = "<p>No se encontraron juegos populares.</p>";
        }
    } else {
        gamesList.innerHTML = "<p>Error al cargar juegos populares.</p>";
    }
}




const userDisplay = document.getElementById('userDisplay');
const menuOptions = document.getElementById('menuOptions');
const cerrarSesion = document.getElementById('cerrarSesion');

if (cerrarSesion) {
  cerrarSesion.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/logout', { method: 'POST' });
    actualizarEscenario(null);
  });
}

// Alternar el menú al hacer clic en el usuario
userDisplay.addEventListener('click', (e) => {
    e.stopPropagation(); // evita que el click cierre el menú inmediatamente
    menuOptions.classList.toggle('show');
});

// Cerrar el menú si se hace clic fuera
window.addEventListener('click', (e) => {
    if (!userDisplay.contains(e.target)) {
        menuOptions.classList.remove('show');
    }
});


// Cerrar sesión
cerrarSesion.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('usuario');
    menuOptions.classList.remove('show');
    actualizarEscenario(null);
});



