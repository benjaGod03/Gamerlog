window.addEventListener('DOMContentLoaded', async function() {
    const gameId = localStorage.getItem('selectedGameId');
    if (!gameId) {
        document.body.innerHTML = "<p>No se seleccionó ningún juego.</p>";
        return;
    }

    // Llama a tu backend para obtener detalles del juego
    const response = await fetch(`/game?id=${encodeURIComponent(gameId)}`);
    if (response.ok) {
        const game = await response.json();

        // Imagen
        document.getElementById('gameImage').src = game.background_image || 'images/img.jpeg';
        document.getElementById('gameImage').alt = game.name || 'Juego';

        // Título y año
        document.getElementById('gameTitle').innerHTML = `${game.name || ''} <span class="year">${(game.released || '').split('-')[0] || ''}</span>`;

        // Tags
        const tagsContainer = document.getElementById('gameTags');
        tagsContainer.innerHTML = '';
        if (game.tags && game.tags.length > 0) {
            game.tags.slice(0, 5).forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag.name;
                tagsContainer.appendChild(span);
            });
        }

        // Plataformas
        document.getElementById('gamePlatforms').textContent = "Plataformas: " + (game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : '');

        // Desarrolladores
        document.getElementById('gameDevelopers').textContent = "Desarrollador: " + (game.developers ? game.developers.map(d => d.name).join(', ') : '');

        // Sinopsis
        document.getElementById('gameSynopsis').textContent = game.description_raw || '';

        // Rating y reviews
        document.getElementById('gameRating').textContent = `✰ ${game.rating || 0}`;
        document.getElementById('gameReviews').textContent = `💬 ${game.reviews_count || 0}`;

        // Estrellas (rating visual)
        const stars = document.getElementById('gameStars');
        stars.innerHTML = '';
        const rating = Math.round(game.rating || 0);
        for (let i = 0; i < 5; i++) {
            stars.innerHTML += i < rating ? '⭐' : '✰';
        }
        cargarReseñas(gameId);
    } else {
        document.body.innerHTML = "<p>Error al cargar los detalles del juego.</p>";
    }
});



// Referencias a los elementos
// Obtener elementos del HTML
async function agregarReseña() {
  const contenedor = document.getElementById('reviewList');
    const reviewTextarea = document.getElementById('reviewText');
  const texto = document.getElementById('reviewText').value.trim();
  let gameIdString = localStorage.getItem('selectedGameId');
  const gameId = parseInt(gameIdString, 10);

  if (texto === "") {
    alert("No podés publicar una reseña vacía.");
    return;
  }

  const datosReseña = {
    texto: texto,
    juego: gameId,
    
  }

      try {
        // 4. Solicitud POST al backend (ASP.NET Core)
        const response = await fetch('review', {
            method: 'POST',
            // No necesitas credenciales extra; la Cookie se envía automáticamente
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datosReseña) 
        });

        // 5. Manejar la respuesta
        if (response.ok) {
            // El servidor respondió 200/201. Debería devolver la reseña completa.
            const reseñaGuardada = await response.json(); 
            
            // 6. Actualizar el DOM con los datos confirmados del servidor
            mostrarReseñaEnDOM(reseñaGuardada.texto, reseñaGuardada.fecha, reseñaGuardada.usuario);
            
            // Limpiar textarea
            reviewTextarea.value = "";
            
        } else if (response.status === 401) {
            alert("Debes iniciar sesión para publicar una reseña.");
        } else {
            // Manejar otros errores (400, 500, etc.)
            alert("Error al guardar la reseña en el servidor.");
        }

    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    }
}

function mostrarReseñaEnDOM(texto, fecha, usuario) {
    const contenedor = document.getElementById('reviewList');
    
    // Formatear la fecha recibida del servidor (que viene como string ISO)
    const fechaHora = new Date(fecha);
    const fechaTexto = fechaHora.toLocaleDateString();
    const horaTexto = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fechaHoraTexto = `${fechaTexto} ${horaTexto}`;

    const nuevaReseña = document.createElement('div');
    nuevaReseña.classList.add('review');

    nuevaReseña.innerHTML = `
        <p class="review-text">${texto}</p>
        <div class="review-footer">
            <span class="review-date">Publicado por ${usuario} el ${fechaHoraTexto}</span>
        </div>
    `;

    // Insertar al inicio o al final (depende de tu diseño)
    contenedor.appendChild(nuevaReseña); 
}

async function cargarReseñas(gameID) {
    try {
        const response = await fetch(`/cargarReviews?gameId=${encodeURIComponent(gameID)}`);
        
        if (response.ok) {
            const reseñas = await response.json();
            
            // 💡 1. Limpiar el contenedor antes de cargar nuevas reseñas (opcional)
            const contenedor = document.getElementById('reviewList');
            contenedor.innerHTML = ''; 

            // 💡 2. Iterar sobre la lista de reseñas recibidas
            reseñas.forEach(reseña => {
                mostrarReseñaEnDOM(reseña.Texto, reseña.Fecha, reseña.Usuario);
            });

        } else if (response.status === 404) {
            console.warn("No se encontraron reseñas para este juego.");
            // Podrías mostrar un mensaje de "Sé el primero en comentar"
        } else {
            console.error(`Error al cargar reseñas: ${response.status}`);
        }

    } catch (error) {
        console.error('Error de red al intentar cargar las reseñas:', error);
    }
}