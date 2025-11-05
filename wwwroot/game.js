window.addEventListener('DOMContentLoaded', async function() {
    await fetchMeAndUpdate();
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
        document.getElementById('gameLikes').textContent = `♡ ${game.CantidadLikes|| 0}`;

        // estrellas 
       const stars = document.getElementById('gameStars');
        
        const rating = game.PromCalificacion || 0;
        const percentage = (rating / 5) * 100;
        const formattedRating = rating.toFixed(1);
      stars.innerHTML = `
      <span class="rating-score">${formattedRating}</span>
      <div class="precision-rating">
        <div class="background-stars">
            ★★★★★
            </div>
          <div class="filled-stars" style="width: ${percentage}%;">
          ★★★★★
          </div>
        </div>
       
      `;
        cargarReseñas(gameId);
        
        setupActionButtons(gameId, game.name);
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


async function addGameToBacklogAPI(gameId) {
    console.log(`Enviando al backend... ID: ${gameId}`);
    try {
        const response = await fetch('/listas', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ juego: gameId, funcion: "backlog" })
        });
        if (!response.ok) {
          showFeedback("Debe estar logeado para añadir al backlog.")
          throw new Error(`Error: ${response.status}`);
        };
        return 
    } catch (error) {
        console.error("Error en addGameToBacklogAPI:", error);
        throw error; 
    }
}
function showFeedback(message) {
  const feedback = document.getElementById('feedbackMessage');
  if (!feedback) return;

  feedback.textContent = message;
  feedback.classList.add('show'); 

  // Oculta el mensaje después de 3 segundos
  setTimeout(() => {
    feedback.classList.remove('show');
    setTimeout(() => { feedback.textContent = ''; }, 300); 
  }, 3000);
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
  setupScrollToReview();

  const btnVolver = document.getElementById('btnVolver');
    
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            history.back();
        });
    }
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
            
            console.log("URL Foto Usuario:", reseñaGuardada.foto); // depuración      
            mostrarReseñaEnDOM(reseñaGuardada.texto, reseñaGuardada.fecha, reseñaGuardada.usuario, reseñaGuardada.rating, reseñaGuardada.foto);
            
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

function mostrarReseñaEnDOM(texto, fecha, usuario, ratingSeleccionado, urlFotoUsuario) {
    const contenedor = document.getElementById('reviewList');
    
    // formatear la fecha
    const fechaHora = new Date(fecha);
    const fechaTexto = fechaHora.toLocaleDateString();
    const horaTexto = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fechaHoraTexto = `${fechaTexto} ${horaTexto}`;
    console.log("URL Foto Usuario:", urlFotoUsuario); // depuración      
    const nuevaReseña = document.createElement('div');
    nuevaReseña.classList.add('review');

     // mostrar estrellas según el ratingSeleccionado actual
  const estrellasHTML = ratingSeleccionado > 0
    ? '★'.repeat(ratingSeleccionado) + '☆'.repeat(5 - ratingSeleccionado)
    : '— sin calificación —';

    const photoStyle = urlFotoUsuario ? `background-image: url(${urlFotoUsuario})` : '';
    nuevaReseña.innerHTML = `
        <div class="review-header">
            <div class="review-user-info">
            <div class="reviewPhoto" style="${photoStyle}">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32" xml:space="preserve"><path d="M16 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM27 32a1 1 0 0 1-1-1v-6.115a6.95 6.95 0 0 0-6.942-6.943h-6.116A6.95 6.95 0 0 0 6 24.885V31a1 1 0 1 1-2 0v-6.115c0-4.93 4.012-8.943 8.942-8.943h6.116c4.93 0 8.942 4.012 8.942 8.943V31a1 1 0 0 1-1 1z"/></svg>
            </div>
            <span class="review-username">${usuario}</span>
            </div>
            <span class="review-rating">${estrellasHTML}</span>
        </div>
        <p class="review-text">${texto}</p>
         <div class="review-footer">
            <span class="review-date">${fechaHoraTexto}</span>
          <div class="user-photo">
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
                mostrarReseñaEnDOM(reseña.Texto, reseña.Fecha, reseña.Usuario, reseña.Rating, reseña.Foto);
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

async function setupActionButtons(gameId, gameName) {
  const playedBtn = document.getElementById('Jugado');
  const likeBtn = document.getElementById('like');
  const backlogButton = document.getElementById('añadirplaylist');
  const feedback = document.getElementById('feedbackMessage');
  let gameIdint = parseInt(gameId, 10);

    function actualizarTextoBacklog(estaAñadido) {
    if (backlogButton) {
      // Cambiamos el texto Y el emoji
      backlogButton.textContent = estaAñadido ? "➖ Quitar de backlog" : "➕ Añadir a backlog";
    }
  }
  const estado = await actualizarBotonesEstado(gameIdint);
  if (playedBtn) {
    if (estado.played) playedBtn.classList.add('active'); else playedBtn.classList.remove('active');
  }
  if (likeBtn) {
    if (estado.liked) likeBtn.classList.add('active'); else likeBtn.classList.remove('active');
  }
  if (backlogButton) {
    if (estado.pendiente) {
      backlogButton.classList.add('added'); 
      actualizarTextoBacklog(true);
    }else {
      backlogButton.classList.remove('added');
      actualizarTextoBacklog(false);
  }
}
  if (playedBtn) {
    playedBtn.addEventListener('click', async () => {
      try {
       // toggle visual
       playedBtn.classList.toggle('active');
        const isPlayed = playedBtn.classList.contains('active');
        if (isPlayed && backlogButton) {
            backlogButton.classList.remove('added'); // desactiva visualmente el backlog
        }
        // enviar estado al backend
        const response = await fetch('/listas', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ juego: gameIdint, funcion: "played" })
        });
        if (!response.ok) {
          playedBtn.classList.toggle('active');
          showFeedback("Debe estar logeado para marcar como jugado.")
          throw new Error(`Error: ${response.status}`);
        }
        if (isPlayed && backlogButton) {
            backlogButton.classList.remove('added');
            // Llama a la función que creamos antes
            actualizarTextoBacklog(false); // Pone el texto "➕ Añadir a backlog"
        }
      } catch (err) {
        console.error('Error toggling played:', err);
        // revert visual on error
      }
    });
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      try {
        likeBtn.classList.toggle('active');
        const isLiked = likeBtn.classList.contains('active');
       const response = await fetch('/listas', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ juego: gameIdint, funcion: "like"})
       });
       if (!response.ok) {
          likeBtn.classList.remove('active');
          showFeedback("Debe estar logeado para marcar como gustado.")
          throw new Error(`Error: ${response.status}`);
        }
      } catch (err) {
        console.error('Error toggling like:', err);
      }
    });
  }
  if (backlogButton) {
    backlogButton.addEventListener('click', async () => {
      try {
        backlogButton.classList.add('loading');
        const response = await addGameToBacklogAPI(gameIdint);
        // response esperado: { message: "..." }
        const message = response && response.message
          ? response.message.replace('{gameName}', gameName || '')
          : 'Añadido al backlog';

        showFeedback(message);

        backlogButton.classList.remove('loading');
        backlogButton.classList.toggle('added');
        const isAdded = backlogButton.classList.contains('added');
        
        actualizarTextoBacklog(isAdded);

        if (isAdded && playedBtn) {
            playedBtn.classList.remove('active'); 
        }
        
        backlogButton.dispatchEvent(new CustomEvent('backlog:added', { detail: { message } }));
      } catch (error) {
        console.error('Error al añadir a backlog:', error);
        showFeedback('Error: no se pudo añadir al backlog.');
        backlogButton.classList.remove('loading');
      }
    });
  }
}

async function actualizarBotonesEstado(gameIdint) {
    try {
        const response = await fetch(`/EstadoBotones?gameId=${gameIdint}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            console.error('Error al obtener el estado de los botones:', response.statusText);
            return null;
        }

        const data = await response.json();
        return {
            played: !!(data.played || data.Jugado || data.jugado),
            liked: !!(data.like || data.MeGusta || data.meGusta || data.like),
            pendiente: !!(data.pendiente || data.Pendiente)
        };

    } catch (error) {
        console.error('Fallo de red al obtener el estado de los botones:', error);
        return null;
    }
}

function setupScrollToReview() {
  const btnScroll = document.getElementById('btnScrollToReview');
  const reviewTextarea = document.getElementById('reviewText');

  if (btnScroll && reviewTextarea) {
    btnScroll.addEventListener('click', () => {
      reviewTextarea.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      reviewTextarea.focus();
    });
  }
}

