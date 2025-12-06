// Abrir modal de detalle de experiencia
async function openExperienceModal(experienceId) {
  try {
    const res = await fetch(`/api/experiences/${experienceId}`);
    const exp = await res.json();

    // Configurar imagen principal
    const mainImage = document.getElementById("modalMainImage");
    mainImage.src =
      exp.photos && exp.photos.length > 0
        ? exp.photos[0]
        : "https://via.placeholder.com/900x400";

    // Título
    document.getElementById("modalTitle").textContent = exp.title;

    // Badges
    const badgesContainer = document.getElementById("modalBadges");
    badgesContainer.innerHTML = `
          <span class="experience-badge badge-activity">${exp.activity}</span>
          <span class="experience-badge badge-difficulty">${
            exp.difficulty
          }</span>
          <span class="experience-badge badge-status">${
            exp.status === "published"
              ? "Publicado"
              : exp.status === "draft"
              ? "Borrador"
              : "Archivado"
          }</span>
        `;

    // Grid de información
    const infoGrid = document.getElementById("modalInfoGrid");
    const dateFormatted = new Date(exp.date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    infoGrid.innerHTML = `
          <div class="experience-info-item">
            <span class="experience-info-label">Ubicación</span>
            <span class="experience-info-value">📍 ${exp.location}</span>
          </div>
          <div class="experience-info-item">
            <span class="experience-info-label">Fecha</span>
            <span class="experience-info-value">📅 ${dateFormatted}</span>
          </div>
          <div class="experience-info-item">
            <span class="experience-info-label">Grupo</span>
            <span class="experience-info-value">👥 ${exp.minGroupSize || 1} - ${
      exp.maxGroupSize
    } personas</span>
          </div>
          <div class="experience-info-item">
            <span class="experience-info-label">Calificación</span>
            <span class="experience-info-value">⭐ ${exp.rating.toFixed(
              1
            )} / 5.0</span>
          </div>
        `;

    // Descripción
    document.getElementById("modalDescription").textContent = exp.description;

    // Galería de fotos (si hay más de 1)
    const photosContainer = document.getElementById("modalPhotosContainer");
    if (exp.photos && exp.photos.length > 1) {
      photosContainer.innerHTML = `
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Galería de Fotos</h3>
            <div class="experience-photos-gallery">
              ${exp.photos
                .map(
                  (photo) => `<img src="${photo}" alt="Foto de experiencia">`
                )
                .join("")}
            </div>
          `;
    } else {
      photosContainer.innerHTML = "";
    }

    // Precio
    const priceFormatted = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: exp.currency || "MXN",
    }).format(exp.pricePerPerson);

    document.getElementById("modalPrice").textContent = priceFormatted;

    // Botón de reservar
    const btnReserve = document.getElementById("btnReserve");

    // Verificar si el usuario es el dueño
    const user = JSON.parse(localStorage.getItem("user") || "null");
    let isOwner = false;

    if (user) {
      try {
        const guideRes = await fetch(`/api/guides/${exp.guideId}`);
        if (guideRes.ok) {
          const guide = await guideRes.json();
          if (guide.userId === user._id) {
            isOwner = true;
          }
        }
      } catch (e) {
        console.error("Error verificando propiedad", e);
      }
    }

    if (isOwner) {
      btnReserve.textContent = "Es tu experiencia";
      btnReserve.disabled = true;
      btnReserve.style.backgroundColor = "#ccc";
      btnReserve.style.cursor = "not-allowed";
      btnReserve.onclick = null;
    } else {
      btnReserve.textContent = "Reservar Ahora";
      btnReserve.disabled = false;
      btnReserve.style.backgroundColor = ""; // Restaurar estilo original
      btnReserve.style.cursor = "pointer";
      btnReserve.onclick = () => {
        openReservationModal(exp);
      };
    }

    // Mostrar modal
    // Cargar reviews del guía
    await loadGuideReviews(exp.guideId);

    document.getElementById("experienceDetailModal").style.display = "block";
  } catch (err) {
    console.error("Error al cargar experiencia:", err);
    alert("Error al cargar los detalles de la experiencia");
  }
}

// Variables globales para la reserva
let currentExperience = null;
let selectedSeats = 1;

// Abrir modal de reserva
function openReservationModal(experience) {
  // Verificar si el usuario está logueado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    alert("Debes iniciar sesión para hacer una reserva");
    window.location.href = "/api/auth/login";
    return;
  }

  // Verificar que la experiencia esté publicada
  if (experience.status !== "published") {
    const alertDiv = document.getElementById("reservationAlert");
    alertDiv.textContent =
      "Esta experiencia no está disponible para reservar en este momento.";
    alertDiv.style.display = "block";
    return;
  }

  // Verificar que la fecha no haya pasado
  const experienceDate = new Date(experience.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (experienceDate < today) {
    alert("Esta experiencia ya ha pasado y no está disponible para reservar.");
    return;
  }

  currentExperience = experience;
  selectedSeats = 1;

  // Llenar información de la experiencia
  document.getElementById("reservationExpTitle").textContent = experience.title;

  const dateFormatted = new Date(experience.date).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("reservationExpDate").textContent = dateFormatted;
  document.getElementById("reservationExpLocation").textContent =
    experience.location;

  const priceFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: experience.currency || "MXN",
  }).format(experience.pricePerPerson);
  document.getElementById("reservationPricePerPerson").textContent =
    priceFormatted;

  // Configurar selector de asientos
  document.getElementById("seatsDisplay").textContent = selectedSeats;
  document.getElementById("seatsAvailableLabel").textContent = `Disponibles: ${
    experience.minGroupSize || 1
  } - ${experience.maxGroupSize} personas`;

  // Calcular y mostrar total
  updateReservationTotal();

  // Ocultar alerta
  document.getElementById("reservationAlert").style.display = "none";

  // Cerrar modal de experiencia y abrir modal de reserva
  document.getElementById("experienceDetailModal").style.display = "none";
  document.getElementById("reservationModal").style.display = "block";
}

// Actualizar total de la reserva
function updateReservationTotal() {
  if (!currentExperience) return;

  const total = currentExperience.pricePerPerson * selectedSeats;
  const totalFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currentExperience.currency || "MXN",
  }).format(total);

  document.getElementById("reservationTotal").textContent = totalFormatted;

  // Actualizar estado de botones
  const decreaseBtn = document.getElementById("decreaseSeats");
  const increaseBtn = document.getElementById("increaseSeats");

  decreaseBtn.disabled = selectedSeats <= 1;
  increaseBtn.disabled = selectedSeats >= currentExperience.maxGroupSize;
}

// Decrementar asientos
document.getElementById("decreaseSeats").addEventListener("click", () => {
  if (selectedSeats > 1) {
    selectedSeats--;
    document.getElementById("seatsDisplay").textContent = selectedSeats;
    updateReservationTotal();
  }
});

// Incrementar asientos
document.getElementById("increaseSeats").addEventListener("click", () => {
  if (currentExperience && selectedSeats < currentExperience.maxGroupSize) {
    selectedSeats++;
    document.getElementById("seatsDisplay").textContent = selectedSeats;
    updateReservationTotal();
  }
});

// Cerrar modal de reserva
document
  .getElementById("closeReservationModal")
  .addEventListener("click", () => {
    document.getElementById("reservationModal").style.display = "none";
  });

document
  .getElementById("btnCancelReservation")
  .addEventListener("click", () => {
    document.getElementById("reservationModal").style.display = "none";
  });

// Confirmar reserva
document
  .getElementById("btnConfirmReservation")
  .addEventListener("click", async () => {
    if (!currentExperience) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Debes iniciar sesión para hacer una reserva");
      window.location.href = "/api/auth/login";
      return;
    }

    // Validar número de asientos
    if (selectedSeats < (currentExperience.minGroupSize || 1)) {
      alert(
        `El número mínimo de personas es ${currentExperience.minGroupSize || 1}`
      );
      return;
    }

    if (selectedSeats > currentExperience.maxGroupSize) {
      alert(
        `El número máximo de personas es ${currentExperience.maxGroupSize}`
      );
      return;
    }

    const total = currentExperience.pricePerPerson * selectedSeats;

    const reservationData = {
      experienceId: currentExperience._id,
      userId: user._id,
      seats: selectedSeats,
      total: total,
      status: "pending",
    };

    try {
      let token = localStorage.getItem("accessToken");

      let res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      // Si el token expiró, intentar refrescarlo
      if (res.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          res = await fetch("/api/reservations", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + newToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reservationData),
          });
        } else {
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
          localStorage.clear();
          window.location.href = "/api/auth/login";
          return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        alert(
          "¡Reserva confirmada exitosamente! Nos pondremos en contacto contigo pronto."
        );
        document.getElementById("reservationModal").style.display = "none";
        currentExperience = null;
        selectedSeats = 1;
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear la reserva");
      }
    } catch (err) {
      console.error("Error al crear reserva:", err);
      alert("Error al procesar la reserva. Por favor intenta de nuevo.");
    }
  });

// Cerrar modal de experiencia
document
  .getElementById("closeExperienceModal")
  .addEventListener("click", () => {
    document.getElementById("experienceDetailModal").style.display = "none";
  });

// Cerrar al hacer click fuera de los modales
window.addEventListener("click", (e) => {
  const experienceModal = document.getElementById("experienceDetailModal");
  const reservationModal = document.getElementById("reservationModal");

  if (e.target === experienceModal) {
    experienceModal.style.display = "none";
  }

  if (e.target === reservationModal) {
    reservationModal.style.display = "none";
  }
});

// Función para cargar reviews del guía
async function loadGuideReviews(guideId) {
  const reviewsContainer = document.getElementById("reviewsContainer");
  reviewsContainer.innerHTML =
    '<div class="reviews-loading">Cargando reseñas...</div>';

  try {
    const res = await fetch(`/api/reviews?guideId=${guideId}`);
    if (!res.ok) {
      throw new Error("Error al cargar reviews");
    }

    const reviews = await res.json();

    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + (r.guideRating || 0), 0) /
        reviews.length;

      document.getElementById("guideAvgRating").textContent =
        avgRating.toFixed(1);
      document.getElementById("guideReviewCount").textContent = `${
        reviews.length
      } reseña${reviews.length !== 1 ? "s" : ""}`;

      const starsContainer = document.getElementById("guideRatingStars");
      starsContainer.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.className =
          i <= Math.round(avgRating) ? "star-filled" : "star-empty";
        star.textContent = "★";
        starsContainer.appendChild(star);
      }

      renderReviews(reviews);
    } else {
      reviewsContainer.innerHTML =
        '<div class="no-reviews">Este guía aún no tiene reseñas</div>';
      document.getElementById("guideAvgRating").textContent = "-";
      document.getElementById("guideReviewCount").textContent =
        "Sin calificaciones";
      document.getElementById("guideRatingStars").innerHTML = "";
    }
  } catch (err) {
    console.error("Error al cargar reviews:", err);
    reviewsContainer.innerHTML =
      '<div class="no-reviews">Error al cargar reseñas</div>';
  }
}

function renderReviews(reviews) {
  const container = document.getElementById("reviewsContainer");

  if (reviews.length === 0) {
    container.innerHTML =
      '<div class="no-reviews">Este guía aún no tiene reseñas</div>';
    return;
  }

  const reviewsList = document.createElement("div");
  reviewsList.className = "reviews-list";

  reviews.forEach((review) => {
    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";

    const reviewDate = new Date(review.createdAt).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const expStars = generateStars(review.experienceRating || 0);
    const guideStars = generateStars(review.guideRating || 0);
    const userName = review.userId?.name || "Usuario";

    reviewCard.innerHTML = `
              <div class="review-header">
                <div class="review-user-info">
                  <div class="review-user-name">${userName}</div>
                  <div class="review-date">${reviewDate}</div>
                </div>
                <div class="review-ratings">
                  <div class="review-rating-item">
                    <span>Experiencia:</span>
                    <div class="review-stars">${expStars}</div>
                  </div>
                  <div class="review-rating-item">
                    <span>Guía:</span>
                    <div class="review-stars">${guideStars}</div>
                  </div>
                </div>
              </div>
              <div class="review-comment">${
                review.comment || "Sin comentario"
              }</div>
              ${
                review.photos && review.photos.length > 0
                  ? `
                <div class="review-photos">
                  ${review.photos
                    .map(
                      (photo) =>
                        `<img src="${photo}" alt="Foto de reseña" class="review-photo">`
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            `;

    reviewsList.appendChild(reviewCard);
  });

  container.innerHTML = "";
  container.appendChild(reviewsList);
}

function generateStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="${
      i <= rating ? "star-filled" : "star-empty"
    }">★</span>`;
  }
  return stars;
}
