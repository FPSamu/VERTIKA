/* experience-logic.js */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener ID de la URL (Asumiendo ruta /view/:id o query param ?id=)
    // Para este ejemplo, tomaremos el último segmento de la URL
    const pathSegments = window.location.pathname.split('/');
    const experienceId = pathSegments[pathSegments.length - 1] || 'ID_DE_PRUEBA'; // Ajusta según tu router

    // Variables globales para el estado
    let currentExperience = null;
    let currentPhotos = [];
    let selectedSeats = 1;
    let guideReviews = [];

    // --- FUNCIONES API ---
    async function fetchExperienceData(id) {
        try {
            // Simulación de fetch (Reemplaza con tu URL real: `/api/experiences/${id}`)
            const res = await fetch(`/api/experiences/${id}`);
            if (!res.ok) throw new Error("No se pudo cargar la experiencia");
            const data = await res.json();
            currentExperience = data;
            currentPhotos = data.photos || [];
            renderExperience(data);
            fetchGuideReviews(data.guideId);
        } catch (err) {
            console.error(err);
            document.getElementById('expTitle').textContent = "Error al cargar la experiencia";
        }
    }

    async function fetchGuideReviews(guideId) {
        try {
            const res = await fetch(`/api/reviews?guideId=${guideId}`);
            const reviews = await res.json();
            guideReviews = reviews;
            renderReviewsAndStats(reviews);
        } catch (err) {
            console.error("Error cargando reviews", err);
        }
    }

    // --- RENDERIZADO ---
    function renderExperience(exp) {
        // Textos básicos
        document.getElementById('expTitle').textContent = exp.title;
        document.getElementById('expLocation').textContent = exp.location;
        document.getElementById('expDescription').textContent = exp.description;
        
        // Formato de fechas
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = new Date(exp.date).toLocaleDateString('es-MX', dateOptions);
        document.getElementById('expDateText').textContent = dateStr;
        document.getElementById('cardDateShort').textContent = new Date(exp.date).toLocaleDateString('es-MX', {month:'short', day:'numeric'});

        // Formato Precio
        const priceStr = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(exp.pricePerPerson);
        document.getElementById('cardPrice').textContent = priceStr;
        
        // Grupo y Dificultad
        document.getElementById('expGroupSize').textContent = `${exp.minGroupSize || 1} - ${exp.maxGroupSize} personas`;
        document.getElementById('cardGroupShort').textContent = `1 Huésped (Máx ${exp.maxGroupSize})`;
        document.getElementById('expDifficulty').textContent = exp.difficulty; // Asegúrate de capitalizarlo si viene en minuscula

        // Guía
        document.getElementById('guideName').textContent = exp.guideName || "El Guía"; // Asumiendo que viene populated
        // Si tienes avatar en exp.guideAvatar usalo, si no placeholder
        if(exp.guideAvatar) document.getElementById('guideAvatar').src = exp.guideAvatar;

        // Galería
        renderGalleryGrid(exp.photos);

        // Actualizar Modal de Reserva con datos iniciales
        document.getElementById('reservationExpTitle').textContent = exp.title;
        document.getElementById('reservationExpLocation').textContent = exp.location;
        document.getElementById('reservationExpDate').textContent = dateStr;
        document.getElementById('seatsAvailableLabel').textContent = `Máximo ${exp.maxGroupSize} personas`;
        if(exp.photos && exp.photos.length > 0) document.getElementById('summaryImg').src = exp.photos[0];
        
        updateReservationCalculations();
    }

    function renderReviewsAndStats(reviews) {
        const container = document.getElementById('reviewsContainer');
        container.innerHTML = '';

        if (!reviews || reviews.length === 0) {
            document.getElementById('avgRatingNum').textContent = "Nuevo";
            document.getElementById('cardRating').textContent = "★ Nuevo";
            document.getElementById('expRatingHeader').innerHTML = '<i class="fa-solid fa-star"></i> Nuevo';
            document.getElementById('totalReviewsText').textContent = "0 evaluaciones";
            return;
        }

        // Calcular promedio
        const avg = reviews.reduce((acc, r) => acc + (r.guideRating || 5), 0) / reviews.length;
        const avgDisplay = avg.toFixed(2);
        
        document.getElementById('avgRatingNum').textContent = avgDisplay;
        document.getElementById('ratingVal').textContent = avgDisplay;
        document.getElementById('cardRating').textContent = `★ ${avgDisplay}`;
        document.getElementById('totalReviewsText').textContent = `${reviews.length} evaluaciones`;
        document.getElementById('guideReviewCount').textContent = `${reviews.length} reseñas`;

        // Renderizar reviews (Solo las primeras 4)
        reviews.slice(0, 4).forEach(r => {
            const date = new Date(r.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
            const div = document.createElement('div');
            div.className = 'review-card';
            div.innerHTML = `
                <div class="review-header">
                    <img src="${r.userAvatar || 'https://via.placeholder.com/40'}" class="reviewer-img">
                    <div class="reviewer-info">
                        <h4>${r.userName || 'Usuario'}</h4>
                        <span class="review-date">${date}</span>
                    </div>
                </div>
                <div class="review-body">${r.comment}</div>
            `;
            container.appendChild(div);
        });
    }

    function renderGalleryGrid(photos) {
        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = '';
        
        if (!photos || photos.length === 0) return;

        // Lógica: Mostrar máximo 5 fotos en el grid
        const displayPhotos = photos.slice(0, 5);

        displayPhotos.forEach((photo, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `<img src="${photo}" alt="Foto ${index + 1}" onclick="openLightbox(${index})">`;
            grid.appendChild(div);
        });
    }

    // --- LÓGICA LIGHTBOX ---
    window.openLightbox = (index) => {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        let currentIndex = index;

        const updateImage = () => {
            img.src = currentPhotos[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${currentPhotos.length}`;
        };

        lightbox.style.display = 'flex';
        updateImage();

        // Eventos de navegación
        document.getElementById('lightboxNext').onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % currentPhotos.length;
            updateImage();
        };

        document.getElementById('lightboxPrev').onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
            updateImage();
        };

        document.getElementById('lightboxClose').onclick = () => {
            lightbox.style.display = 'none';
        };
        
        // Cerrar con Escape
        document.onkeydown = (e) => {
            if(e.key === "Escape") lightbox.style.display = 'none';
            if(e.key === "ArrowRight") document.getElementById('lightboxNext').click();
            if(e.key === "ArrowLeft") document.getElementById('lightboxPrev').click();
        }
    };

    document.getElementById('viewGalleryBtn').addEventListener('click', () => {
        if(currentPhotos.length > 0) window.openLightbox(0);
    });

    // --- LÓGICA RESERVA ---
    function updateReservationCalculations() {
        if(!currentExperience) return;
        const total = currentExperience.pricePerPerson * selectedSeats;
        
        // Formateador
        const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
        
        // Textos del modal
        document.getElementById('seatsDisplay').textContent = selectedSeats;
        document.getElementById('priceCalculationText').textContent = `${fmt.format(currentExperience.pricePerPerson)} x ${selectedSeats} viajeros`;
        document.getElementById('reservationTotal').textContent = fmt.format(total);
        document.getElementById('reservationFinalTotal').textContent = fmt.format(total);
        
        // Botones stepper
        document.getElementById('decreaseSeats').disabled = selectedSeats <= 1;
        document.getElementById('increaseSeats').disabled = selectedSeats >= (currentExperience.maxGroupSize || 10);
    }

    // Botón abrir modal
    document.getElementById('btnOpenReservation').addEventListener('click', () => {
        // Verificar Auth aquí si es necesario
        const user = localStorage.getItem('user'); // O tu lógica de token
        if(!user) {
            alert("Por favor inicia sesión para reservar");
            window.location.href = '/api/auth/login';
            return;
        }
        document.getElementById('reservationModal').style.display = 'block';
    });

    // Cerrar modal
    document.getElementById('closeReservationModal').addEventListener('click', () => {
        document.getElementById('reservationModal').style.display = 'none';
    });

    // Stepper
    document.getElementById('increaseSeats').addEventListener('click', () => {
        if (currentExperience && selectedSeats < currentExperience.maxGroupSize) {
            selectedSeats++;
            updateReservationCalculations();
        }
    });

    document.getElementById('decreaseSeats').addEventListener('click', () => {
        if (selectedSeats > 1) {
            selectedSeats--;
            updateReservationCalculations();
        }
    });

    // Confirmar Reserva (Fetch POST)
    document.getElementById('btnConfirmReservation').addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('accessToken');
        const total = currentExperience.pricePerPerson * selectedSeats;

        const payload = {
            experienceId: currentExperience._id,
            userId: user._id,
            seats: selectedSeats,
            total: total,
            status: 'pending'
        };

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("¡Reserva solicitada con éxito!");
                document.getElementById('reservationModal').style.display = 'none';
            } else {
                const err = await res.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al reservar");
        }
    });

    // Toggle Menú Usuario
    document.getElementById('userMenuBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('userDropdown');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    
    window.addEventListener('click', () => {
        document.getElementById('userDropdown').style.display = 'none';
    });

    // Verificar login para mostrar avatar
    const checkLogin = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if(user) {
            document.getElementById('loginLink').style.display = 'none';
            document.getElementById('profileLink').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
        }
    };
    
    // --- INICIALIZAR ---
    fetchExperienceData(experienceId);
    checkLogin();
});