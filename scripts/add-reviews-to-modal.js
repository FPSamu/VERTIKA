const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'views', 'mainPage.handlebars');

console.log('Leyendo archivo...');
console.log('Ruta:', filePath);
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total de líneas: ${lines.length}`);

// Paso 1: Agregar estilos CSS después de la línea que contiene "/* Modal de Reserva */"
const cssToAdd = `
    /* Estilos para Reviews del Guía */
    .guide-reviews-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #f0f0f0;
    }

    .guide-reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .guide-reviews-title {
      font-size: 24px;
      color: #2c3e50;
      font-weight: bold;
      margin: 0;
    }

    .guide-rating-summary {
      display: flex;
      align-items: center;
      gap: 15px;
      background: #f8f9fa;
      padding: 15px 25px;
      border-radius: 10px;
    }

    .guide-rating-number {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
    }

    .guide-rating-stars {
      display: flex;
      gap: 4px;
      font-size: 24px;
    }

    .guide-rating-stars .star-filled {
      color: #ffd700;
    }

    .guide-rating-stars .star-empty {
      color: #ddd;
    }

    .guide-rating-count {
      font-size: 14px;
      color: #666;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 500px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .review-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      transition: box-shadow 0.3s;
    }

    .review-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .review-user-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .review-user-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 16px;
    }

    .review-date {
      font-size: 12px;
      color: #999;
    }

    .review-ratings {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: flex-end;
    }

    .review-rating-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .review-stars {
      display: flex;
      gap: 2px;
      font-size: 14px;
    }

    .review-comment {
      color: #555;
      line-height: 1.6;
      margin: 12px 0;
      font-size: 14px;
    }

    .review-photos {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .review-photo {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .review-photo:hover {
      transform: scale(1.1);
    }

    .no-reviews {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 16px;
    }

    .reviews-loading {
      text-align: center;
      padding: 40px;
      color: #667eea;
      font-size: 16px;
    }
`;

// Encontrar la línea que contiene "/* Modal de Reserva */"
let cssInsertIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* Modal de Reserva */')) {
    cssInsertIndex = i;
    break;
  }
}

if (cssInsertIndex === -1) {
  console.error('No se encontró "/* Modal de Reserva */"');
  process.exit(1);
}

console.log(`Insertando CSS en línea ${cssInsertIndex}...`);
lines.splice(cssInsertIndex, 0, ...cssToAdd.split('\n'));

// Paso 2: Agregar HTML después de <div id="modalPhotosContainer"></div>
const htmlToAdd = `
        <!-- Sección de Reviews del Guía -->
        <div class="guide-reviews-section">
          <div class="guide-reviews-header">
            <h3 class="guide-reviews-title">Calificaciones del Guía</h3>
            <div class="guide-rating-summary" id="guideRatingSummary">
              <div class="guide-rating-number" id="guideAvgRating">-</div>
              <div>
                <div class="guide-rating-stars" id="guideRatingStars"></div>
                <div class="guide-rating-count" id="guideReviewCount">Sin calificaciones</div>
              </div>
            </div>
          </div>
          <div id="reviewsContainer">
            <div class="reviews-loading">Cargando reseñas...</div>
          </div>
        </div>
`;

let htmlInsertIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div id="modalPhotosContainer"></div>')) {
    htmlInsertIndex = i + 1;
    break;
  }
}

if (htmlInsertIndex === -1) {
  console.error('No se encontró <div id="modalPhotosContainer"></div>');
  process.exit(1);
}

console.log(`Insertando HTML en línea ${htmlInsertIndex}...`);
lines.splice(htmlInsertIndex, 0, ...htmlToAdd.split('\n'));

// Paso 3: Agregar JavaScript antes de fetchExperiences();
const jsToAdd = `
        // Función para cargar reviews del guía
        async function loadGuideReviews(guideId) {
          const reviewsContainer = document.getElementById('reviewsContainer');
          reviewsContainer.innerHTML = '<div class="reviews-loading">Cargando reseñas...</div>';

          try {
            const res = await fetch(\`/api/reviews?guideId=\${guideId}\`);
            if (!res.ok) {
              throw new Error('Error al cargar reviews');
            }

            const reviews = await res.json();

            if (reviews.length > 0) {
              const avgRating = reviews.reduce((sum, r) => sum + (r.guideRating || 0), 0) / reviews.length;
              
              document.getElementById('guideAvgRating').textContent = avgRating.toFixed(1);
              document.getElementById('guideReviewCount').textContent = \`\${reviews.length} reseña\${reviews.length !== 1 ? 's' : ''}\`;

              const starsContainer = document.getElementById('guideRatingStars');
              starsContainer.innerHTML = '';
              for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.className = i <= Math.round(avgRating) ? 'star-filled' : 'star-empty';
                star.textContent = '★';
                starsContainer.appendChild(star);
              }

              renderReviews(reviews);
            } else {
              reviewsContainer.innerHTML = '<div class="no-reviews">Este guía aún no tiene reseñas</div>';
              document.getElementById('guideAvgRating').textContent = '-';
              document.getElementById('guideReviewCount').textContent = 'Sin calificaciones';
              document.getElementById('guideRatingStars').innerHTML = '';
            }
          } catch (err) {
            console.error('Error al cargar reviews:', err);
            reviewsContainer.innerHTML = '<div class="no-reviews">Error al cargar reseñas</div>';
          }
        }

        function renderReviews(reviews) {
          const container = document.getElementById('reviewsContainer');
          
          if (reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">Este guía aún no tiene reseñas</div>';
            return;
          }

          const reviewsList = document.createElement('div');
          reviewsList.className = 'reviews-list';

          reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';

            const reviewDate = new Date(review.createdAt).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const expStars = generateStars(review.experienceRating || 0);
            const guideStars = generateStars(review.guideRating || 0);
            const userName = review.userId?.name || 'Usuario';

            reviewCard.innerHTML = \`
              <div class="review-header">
                <div class="review-user-info">
                  <div class="review-user-name">\${userName}</div>
                  <div class="review-date">\${reviewDate}</div>
                </div>
                <div class="review-ratings">
                  <div class="review-rating-item">
                    <span>Experiencia:</span>
                    <div class="review-stars">\${expStars}</div>
                  </div>
                  <div class="review-rating-item">
                    <span>Guía:</span>
                    <div class="review-stars">\${guideStars}</div>
                  </div>
                </div>
              </div>
              <div class="review-comment">\${review.comment || 'Sin comentario'}</div>
              \${review.photos && review.photos.length > 0 ? \`
                <div class="review-photos">
                  \${review.photos.map(photo => \`<img src="\${photo}" alt="Foto de reseña" class="review-photo">\`).join('')}
                </div>
              \` : ''}
            \`;

            reviewsList.appendChild(reviewCard);
          });

          container.innerHTML = '';
          container.appendChild(reviewsList);
        }

        function generateStars(rating) {
          let stars = '';
          for (let i = 1; i <= 5; i++) {
            stars += \`<span class="\${i <= rating ? 'star-filled' : 'star-empty'}">★</span>\`;
          }
          return stars;
        }

`;

let jsInsertIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'fetchExperiences();') {
    jsInsertIndex = i;
    break;
  }
}

if (jsInsertIndex === -1) {
  console.error('No se encontró fetchExperiences();');
  process.exit(1);
}

console.log(`Insertando JavaScript en línea ${jsInsertIndex}...`);
lines.splice(jsInsertIndex, 0, ...jsToAdd.split('\n'));

// Paso 4: Modificar openExperienceModal para cargar reviews
let modalFunctionIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("document.getElementById('experienceDetailModal').style.display = 'block';")) {
    modalFunctionIndex = i;
    break;
  }
}

if (modalFunctionIndex === -1) {
  console.error('No se encontró la línea para mostrar el modal');
  process.exit(1);
}

console.log(`Agregando llamada a loadGuideReviews en línea ${modalFunctionIndex}...`);
lines.splice(modalFunctionIndex, 0, '        // Cargar reviews del guía', '        await loadGuideReviews(exp.guideId);', '');

// Guardar archivo
const newContent = lines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Archivo modificado exitosamente!');
console.log(`Nuevas líneas totales: ${lines.length}`);
