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
        if (response.ok) {
            const data = await response.json();
            // Aquí puedes mostrar los resultados en pantalla
            console.log(data); // Por ahora, solo muestra en consola
            // Ejemplo: document.getElementById('searchHint').textContent = data.results[0]?.name || 'Sin resultados';
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
            data.results.slice(0, 8).forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game';
                gameDiv.style.cursor = 'pointer';
                gameDiv.innerHTML = `
                    <img src="${game.background_image || 'images/img.jpeg'}" alt="${game.name}">
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
        gamesList.innerHTML = "<p>Error al cargar juegos populares.</p>";
    }
});