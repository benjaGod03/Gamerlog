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
    } else {
        document.body.innerHTML = "<p>Error al cargar los detalles del juego.</p>";
    }
});



// Referencias a los elementos
// Obtener elementos del HTML
function agregarReseña() {
  const contenedor = document.getElementById('reviewList');
  const texto = document.getElementById('reviewText').value.trim();

  if (texto === "") {
    alert("No podés publicar una reseña vacía.");
    return;
  }

  // Crear la reseña
  const nuevaReseña = document.createElement('div');
  nuevaReseña.classList.add('review');

  // Fecha y hora actual
  const fechaHora = new Date();
  const fecha = fechaHora.toLocaleDateString();
  const hora = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fechaHoraTexto = `${fecha} ${hora}`;

  // Contenido HTML de la reseña
  nuevaReseña.innerHTML = `
    <p class="review-text">${texto}</p>
    <div class="review-footer">
      <span class="review-date">${fechaHoraTexto}</span>
    </div>
  `;

  // Insertar reseña al contenedor
  contenedor.appendChild(nuevaReseña);

  // Limpiar textarea
  document.getElementById('reviewText').value = "";
}