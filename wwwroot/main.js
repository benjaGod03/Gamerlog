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

function actualizarEscenario(usuario) {
    const loginBtn = document.getElementById('showLogin');
    const registerBtn = document.getElementById('openModal');
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
        localStorage.setItem('usuario', Usuario);
        actualizarEscenario(Usuario);
        // Login exitoso
        document.getElementById('loginForm').style.display = 'none';
        
    } else {
        // Error de login
        // Si tienes un div con id="loginError", muéstralo aquí
        // document.getElementById('loginError').style.display = 'block';
        alert("Usuario o contraseña incorrectos");
    }

};

document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('registerUser').value;
    const contrasena = document.getElementById('registerPass').value;
    const email = document.getElementById('registerEmail').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena, email })
    });

    if (response.ok) {
        // Registro exitoso
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        document.getElementById('modal').style.display = 'none';
    }
    else { alert("Error en el registro. Inténtalo de nuevo."); }
    
};

document.getElementById('searchInput').addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query.length === 0) return;

        // Llama a tu backend
        const response = await fetch(`/games?search=${encodeURIComponent(query)}`);
        const listTitle = document.getElementById('listTitle');
        const gamesList = document.getElementById('gamesList');

        if (response.ok) {
            const data = await response.json();
        gamesList.innerHTML = "";

        if (data.results && data.results.length > 0) {
            listTitle.textContent = `Resultados para: "${query}"`;
            data.results.slice(0, 10).forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game-popular';
                gameDiv.style.cursor = 'pointer';
                gameDiv.innerHTML = `
                    <img src="${game.background_image || 'images/img.jpeg'}" alt="${game.name}" class="game-image">
                    <div class="stats">
                        <span>✰ ${game.rating}</span>
                        <span>💬 ${game.reviews_count || 0}</span>
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
            alert("Error al buscar juegos");
        }
    }
});



window.addEventListener('DOMContentLoaded', async function() {
    const gamesList = document.getElementById('gamesList');
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
});

window.addEventListener('DOMContentLoaded', async function() {
    const gamesList = document.getElementById('games-sec');
    gamesList.innerHTML = "<p>Cargando juegos populares...</p>";

    const response = await fetch('/games?search=');
    if (response.ok) {
        const data = await response.json();
        gamesList.innerHTML = "";

        if (data.results && data.results.length > 0) {
            
            data.results.slice(5, 40).forEach(game => {
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
});


const userDisplay = document.getElementById('userDisplay');
const menuOptions = document.getElementById('menuOptions');
const cerrarSesion = document.getElementById('cerrarSesion');

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




