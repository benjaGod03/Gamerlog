window.addEventListener('DOMContentLoaded', async function() {
    const gameId = localStorage.getItem('selectedGameId');
    if (!gameId) {
        document.body.innerHTML = "<p>No se seleccionó ningún juego.</p>";
        return;
    }

    // llama a tu backend para obtener detalles del juego
    const response = await fetch(`/game?id=${encodeURIComponent(gameId)}`);
    if (response.ok) {
        const game = await response.json();

        // imagen
        document.getElementById('gameImage').src = game.background_image || 'images/img.jpeg';
        document.getElementById('gameImage').alt = game.name || 'Juego';

        // título y año
        document.getElementById('gameTitle').innerHTML = `${game.name || ''} <span class="year">${(game.released || '').split('-')[0] || ''}</span>`;

        // tags
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

        // plataformas
        document.getElementById('gamePlatforms').textContent = "Plataformas: " + (game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : '');

        // desarrolladores
        document.getElementById('gameDevelopers').textContent = "Desarrollador: " + (game.developers ? game.developers.map(d => d.name).join(', ') : '');

        // sinopsis
        document.getElementById('gameSynopsis').textContent = game.description_raw || '';
        setupSynopsisToggle();

        // rating y reviews
        document.getElementById('gameRating').textContent = `✰ ${game.PromCalificacion || 0}`;
        document.getElementById('gameReviews').textContent = `💬 ${game.CantidadResenas || 0}`;

        // estrellas 
        const stars = document.getElementById('gameStars');
        stars.innerHTML = '';
        const rating = Math.round(game.PromCalificacion || 0);
        for (let i = 0; i < 5; i++) {
            stars.innerHTML += i < rating ? '⭐' : '✰';
        }
        cargarReseñas(gameId);
    } else {
        document.body.innerHTML = "<p>Error al cargar los detalles del juego.</p>";
    }
});

function setupSynopsisToggle() {
  const synopsisElement = document.getElementById('gameSynopsis');
  const toggleBtn = document.getElementById('toggleSynopsisBtn');
  
  // Altura máxima en píxeles (debe coincidir con el CSS)
  const maxHeight = 110; 

  // Oculta el botón por defecto para empezar de cero
  toggleBtn.style.display = 'none';

  // Comprueba si el contenido es más alto que el límite establecido
  if (synopsisElement.scrollHeight > maxHeight) {
    // Si es más largo, lo colapsa y muestra el botón
    synopsisElement.classList.add('collapsed');
    toggleBtn.style.display = 'block';
    toggleBtn.textContent = 'Mostrar Más'; // Asegura el texto inicial
  }

  // Agrega el evento de clic al botón (si se mostró)
  toggleBtn.addEventListener('click', () => {
    if (synopsisElement.classList.contains('collapsed')) {
      // Expande el texto
      synopsisElement.classList.remove('collapsed');
      toggleBtn.textContent = 'Mostrar Menos';
    } else {
      // Colapsa el texto
      synopsisElement.classList.add('collapsed');
      toggleBtn.textContent = 'Mostrar Más';
    }
  });
}



// configurar interacción con las estrellas
document.addEventListener('DOMContentLoaded', () => {
  const estrellas = document.querySelectorAll('.star');
  const starsContainer = document.getElementById('rating-stars'); 
  starsContainer.dataset.rating = starsContainer.dataset.rating || "0";
  
  estrellas.forEach(estrella => {
    estrella.addEventListener('click', () => {
        const value = parseInt(estrella.getAttribute('data-value'), 10);
      
      starsContainer.dataset.rating = String(value);
      // quitar selección previa
      estrellas.forEach(e => e.classList.remove('selected'));
      // marcar las nuevas
      estrella.classList.add('selected');
      let anterior = estrella.nextElementSibling;
      while (anterior) {
        anterior.classList.add('selected');
        anterior = anterior.nextElementSibling;
      }
    });
  });
});


async function agregarReseña() {
  const contenedor = document.getElementById('reviewList');
    const reviewTextarea = document.getElementById('reviewText');
  const texto = document.getElementById('reviewText').value.trim();
  let gameIdString = localStorage.getItem('selectedGameId');
  const gameId = parseInt(gameIdString, 10);
  const rating = parseInt(document.getElementById('rating-stars').dataset.rating || "0", 10);

  console.log("Rating:", rating); // depuración

  if (texto === "") {
    alert("No podés publicar una reseña vacía.");
    return;
  }

  const datosReseña = {
    texto: texto,
    juego: gameId,
    rating: rating
  }

      try {
        const response = await fetch('review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datosReseña) 
        });

        
        if (response.ok) {
            
            const reseñaGuardada = await response.json(); 
            
            // actualizar el DOM con los datos 
            mostrarReseñaEnDOM(reseñaGuardada.texto, reseñaGuardada.fecha, reseñaGuardada.usuario, reseñaGuardada.rating);
            
            // limpiar textarea
            reviewTextarea.value = "";
            
        } else if (response.status === 401) {
            alert("Debes iniciar sesión para publicar una reseña.");
        } else {
            // manejar otros errores 
            alert("Error al guardar la reseña en el servidor.");
        }

    } catch (error) {
        console.error('Error de conexión o de red:', error);
        alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    }
}

function mostrarReseñaEnDOM(texto, fecha, usuario, ratingSeleccionado) {
    const contenedor = document.getElementById('reviewList');
    
    // formatear la fecha
    const fechaHora = new Date(fecha);
    const fechaTexto = fechaHora.toLocaleDateString();
    const horaTexto = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fechaHoraTexto = `${fechaTexto} ${horaTexto}`;

    const nuevaReseña = document.createElement('div');
    nuevaReseña.classList.add('review');

     // mostrar estrellas según el ratingSeleccionado actual
  const estrellasHTML = ratingSeleccionado > 0
    ? '★'.repeat(ratingSeleccionado) + '☆'.repeat(5 - ratingSeleccionado)
    : '— sin calificación —';

    nuevaReseña.innerHTML = `
        <div class="review-header">
            <span class="review-username">${usuario}</span>
            <span class="review-rating">${estrellasHTML}</span>
        </div>
        <p class="review-text">${texto}</p>
         <div class="review-footer">
            <span class="review-date">${fechaHoraTexto}</span>
        </div>
    `;

    
    contenedor.appendChild(nuevaReseña); 
  document.querySelectorAll('.star').forEach(e => e.classList.remove('selected'));
}

async function cargarReseñas(gameID) {
    try {
        const response = await fetch(`/cargarReviews?gameId=${encodeURIComponent(gameID)}`);
        
        if (response.ok) {
            const reseñas = await response.json();
            
            
            const contenedor = document.getElementById('reviewList');
            contenedor.innerHTML = ''; 

            
            reseñas.forEach(reseña => {
                mostrarReseñaEnDOM(reseña.Texto, reseña.Fecha, reseña.Usuario, reseña.Rating);
            });

        } else if (response.status === 404) {
            console.warn("No se encontraron reseñas para este juego.");
        } else {
            console.error(`Error al cargar reseñas: ${response.status}`);
        }

    } catch (error) {
        console.error('Error de red al intentar cargar las reseñas:', error);
    }
}