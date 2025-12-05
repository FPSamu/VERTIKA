document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. OBTENCIÓN ROBUSTA DEL ID ---
    // Intentamos obtener el ID de dos formas para compatibilidad total
    
    // A. Intentar obtener desde la ruta (ej: /view/12345)
    // Tomamos la última parte de la URL
    let experienceId = window.location.pathname.split('/').pop();

    // B. Si la ruta termina en 'view' o está vacía, buscar en parámetros ?id=12345
    // Esto asegura que tu código anterior siga funcionando
    if (!experienceId || experienceId.toLowerCase() === 'view') {
        const urlParams = new URLSearchParams(window.location.search);
        experienceId = urlParams.get('id');
    }

    console.log("ID de Experiencia detectado:", experienceId);

    // Validación: Si no hay ID, redirigir
    if (!experienceId) {
        // Opcional: Mostrar un mensaje más amigable en el HTML antes de redirigir
        alert('No se especificó ninguna experiencia para mostrar.');
        window.location.href = '/'; 
        return;
    }

    // --- VARIABLES GLOBALES ---
    let currentExpData = null;
    let selectedSeats = 1;
    let galleryImages = []; 

    // --- 2. INICIAR CARGA ---
    await loadExperienceData(experienceId);
    
    // --- LÓGICA DE CARGA DE DATOS ---
    async function loadExperienceData(id) {
        try {
            // Nota: Asegúrate de que tu ruta de API sea correcta (/api/experiences/123)
            const res = await fetch(`/api/experiences/${id}`);
            
            if (!res.ok) {
                if (res.status === 404) throw new Error('Experiencia no encontrada');
                throw new Error('Error de conexión con el servidor');
            }
            
            const exp = await res.json();
            currentExpData = exp; 

            // A. Rellenar Información Principal
            document.title = `${exp.title} - Vertika`;
            
            // Usamos verificaciones seguras (?.) para evitar errores si faltan datos
            const titleEl = document.getElementById('expTitle');
            if (titleEl) titleEl.textContent = exp.title;

            const locEl = document.getElementById('expLocation');
            if (locEl) locEl.textContent = exp.location;

            const descEl = document.getElementById('expDescription');
            if (descEl) descEl.textContent = exp.description;
            
            // Badges
            const badgesContainer = document.getElementById('expBadges');
            if (badgesContainer) {
                badgesContainer.innerHTML = `
                    <span class="experience-badge badge-activity">${exp.activity || 'General'}</span>
                    <span class="experience-badge badge-difficulty">${exp.difficulty || 'Moderado'}</span>
                `;
            }

            // Rating Top
            const ratingEl = document.getElementById('expRating');
            if (ratingEl) {
                ratingEl.innerHTML = `★ ${exp.rating ? exp.rating.toFixed(1) : 'N/A'} (${exp.reviewsCount || 0} reseñas)`;
            }

            // B. Rellenar Features Grid
            const featuresEl = document.getElementById('expFeatures');
            if (featuresEl) {
                const dateFormatted = exp.date ? new Date(exp.date).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'Fecha por definir';
                featuresEl.innerHTML = `
                    <div class="feature-item">
                        <i class="fa-regular fa-calendar feature-icon"></i>
                        <div><strong>Fecha</strong><br>${dateFormatted}</div>
                    </div>
                    <div class="feature-item">
                        <i class="fa-solid fa-people-group feature-icon"></i>
                        <div><strong>Grupo</strong><br>${exp.minGroupSize || 1} - ${exp.maxGroupSize || 10} personas</div>
                    </div>
                    <div class="feature-item">
                        <i class="fa-solid fa-mountain feature-icon"></i>
                        <div><strong>Actividad</strong><br>${exp.activity || 'Aventura'}</div>
                    </div>
                    <div class="feature-item">
                        <i class="fa-solid fa-language feature-icon"></i>
                        <div><strong>Idioma</strong><br>Español</div>
                    </div>
                `;
            }

            // C. Rellenar Sidebar (Booking Card)
            const priceFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: exp.currency || 'MXN' }).format(exp.pricePerPerson || 0);
            
            const cardPrice = document.getElementById('cardPrice');
            if (cardPrice) cardPrice.textContent = priceFormatted;
            
            const cardRating = document.getElementById('cardRating');
            if (cardRating) cardRating.textContent = `★ ${exp.rating ? exp.rating.toFixed(2) : '-'}`;
            
            const cardDate = document.getElementById('cardDate');
            if (cardDate) cardDate.textContent = exp.date ? new Date(exp.date).toLocaleDateString('es-MX') : '--/--/--';
            
            const cardGroup = document.getElementById('cardGroup');
            if (cardGroup) cardGroup.textContent = `${exp.maxGroupSize} máx`;

            // Validación de disponibilidad
            const btnReserve = document.getElementById('btnOpenReservation');
            const msgDiv = document.getElementById('availabilityMsg');
            
            if (btnReserve && msgDiv) {
                if (exp.status !== 'published') {
                    btnReserve.disabled = true;
                    btnReserve.textContent = 'No disponible';
                    btnReserve.style.background = '#ccc';
                    msgDiv.textContent = 'Esta experiencia no está publicada.';
                } else if (new Date(exp.date) < new Date()) {
                    btnReserve.disabled = true;
                    btnReserve.textContent = 'Fecha pasada';
                    btnReserve.style.background = '#ccc';
                    msgDiv.textContent = 'Esta experiencia ya ocurrió.';
                } else {
                    btnReserve.disabled = false;
                    btnReserve.textContent = 'Reservar';
                    btnReserve.style.background = ''; // Restaurar estilo original (CSS)
                    msgDiv.textContent = '';
                    btnReserve.onclick = () => openReservationModal(exp);
                }
            }

            // D. Galería de Imágenes
            setupGallery(exp.photos);

            // E. Info del Guía
            if (exp.guideId) {
                setupGuideInfo(exp.guideId);
                loadReviews(exp.guideId);
            }

        } catch (error) {
            console.error("Error cargando experiencia:", error);
            const container = document.querySelector('.detail-container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Ups, hubo un problema.</h2>
                        <p>${error.message}</p>
                        <a href="/api/experiences" class="btn-reserve-large" style="display:inline-block; width:auto; margin-top:20px;">Ver otras experiencias</a>
                    </div>`;
            }
        }
    }

    // --- SETUP GALERÍA ---
    function setupGallery(photos) {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        
        if (!photos || photos.length === 0) {
            grid.style.display = 'none';
            return;
        }

        galleryImages = photos;
        grid.innerHTML = ''; 

        // Main Image
        const mainDiv = document.createElement('div');
        mainDiv.className = 'gallery-main';
        const img1 = document.createElement('img');
        img1.src = photos[0];
        img1.onclick = () => openLightbox(0);
        // Fallback por si la imagen falla
        img1.onerror = () => { img1.src = 'https://via.placeholder.com/800x600?text=No+Image'; };
        mainDiv.appendChild(img1);
        grid.appendChild(mainDiv);

        // Side Images
        if (photos.length > 1) {
            const sideDiv = document.createElement('div');
            sideDiv.className = 'gallery-side';
            const sidePhotos = photos.slice(1, 5); 
            sidePhotos.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.onclick = () => openLightbox(index + 1); 
                img.onerror = () => { img.style.display = 'none'; };
                sideDiv.appendChild(img);
            });
            grid.appendChild(sideDiv);
        }

        // Botón Ver todas
        const btn = document.createElement('button');
        btn.id = 'viewGalleryBtn';
        btn.className = 'btn-view-photos';
        btn.innerHTML = `<i class="fa fa-th"></i> Ver fotos`;
        btn.onclick = () => openLightbox(0);
        grid.appendChild(btn);
    }

    // --- SETUP INFO GUÍA ---
    async function setupGuideInfo(guideId) {
        try {
            // Ajusta esta ruta según tu API real de usuarios
            const res = await fetch(`/api/users/${guideId.userId}`); 
            if (!res.ok) return;

            const guide = await res.json();
            
            const guideNameEl = document.getElementById('guideName');
            if (guideNameEl) guideNameEl.textContent = guide.name;
            
            const guideAvatarEl = document.getElementById('guideAvatar');
            if (guideAvatarEl && guide.photo) {
                guideAvatarEl.src = guide.photo;
            }
            
            const profileLink = document.getElementById('guideProfileLink');
            if (profileLink) {
                // Ajusta la URL del perfil según tu enrutamiento
                profileLink.href = `/profile/${guide._id}`; 
            }
        } catch (e) {
            console.log("Info del guía no disponible");
        }
    }

    // --- LIGHTBOX (Galería a pantalla completa) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lbCounter = document.getElementById('lightbox-counter');
    let currentLbIndex = 0;

    function openLightbox(index) {
        if (!galleryImages.length) return;
        currentLbIndex = index;
        updateLightboxImage();
        if (lightbox) {
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function updateLightboxImage() {
        if (lightboxImg) lightboxImg.src = galleryImages[currentLbIndex];
        if (lbCounter) lbCounter.textContent = `${currentLbIndex + 1} / ${galleryImages.length}`;
    }

    const closeLb = document.getElementById('lightbox-close');
    if (closeLb) closeLb.onclick = () => {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    };
    
    const nextLb = document.getElementById('lightbox-next');
    if (nextLb) nextLb.onclick = () => {
        currentLbIndex = (currentLbIndex + 1) % galleryImages.length;
        updateLightboxImage();
    };

    const prevLb = document.getElementById('lightbox-prev');
    if (prevLb) prevLb.onclick = () => {
        currentLbIndex = (currentLbIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    };

    // --- MODAL RESERVA ---
    function openReservationModal(experience) {
        const userJson = localStorage.getItem('user');
        
        if (!userJson) {
            alert('Debes iniciar sesión para reservar');
            // Redirige al login, asegurándote de guardar a dónde quería ir
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login.html'; // Ajusta a tu ruta de login
            return;
        }

        const user = JSON.parse(userJson);

        const titleEl = document.getElementById('reservationExpTitle');
        if (titleEl) titleEl.textContent = experience.title;
        
        const dateEl = document.getElementById('reservationExpDate');
        if (dateEl) dateEl.textContent = new Date(experience.date).toLocaleDateString('es-MX');
        
        const priceFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: experience.currency || 'MXN' }).format(experience.pricePerPerson);
        const priceEl = document.getElementById('reservationPricePerPerson');
        if (priceEl) priceEl.textContent = priceFmt;

        selectedSeats = 1;
        updateReservationTotal();

        const modal = document.getElementById('reservationModal');
        if (modal) modal.style.display = 'block';
    }

    function updateReservationTotal() {
        if (!currentExpData) return;
        
        const seatsDisplay = document.getElementById('seatsDisplay');
        if (seatsDisplay) seatsDisplay.textContent = selectedSeats;
        
        const total = currentExpData.pricePerPerson * selectedSeats;
        const totalEl = document.getElementById('reservationTotal');
        if (totalEl) totalEl.textContent = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total);

        const btnDec = document.getElementById('decreaseSeats');
        if (btnDec) btnDec.disabled = (selectedSeats <= 1);
        
        const btnInc = document.getElementById('increaseSeats');
        if (btnInc) btnInc.disabled = (selectedSeats >= currentExpData.maxGroupSize);
        
        const labelAvail = document.getElementById('seatsAvailableLabel');
        if (labelAvail) labelAvail.textContent = `Máximo disponible: ${currentExpData.maxGroupSize}`;
    }

    const btnInc = document.getElementById('increaseSeats');
    if (btnInc) btnInc.onclick = () => {
        if (currentExpData && selectedSeats < currentExpData.maxGroupSize) {
            selectedSeats++;
            updateReservationTotal();
        }
    };

    const btnDec = document.getElementById('decreaseSeats');
    if (btnDec) btnDec.onclick = () => {
        if (selectedSeats > 1) {
            selectedSeats--;
            updateReservationTotal();
        }
    };

    // --- ENVIAR RESERVA ---
    const btnConfirm = document.getElementById('btnConfirmReservation');
    if (btnConfirm) btnConfirm.onclick = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const total = currentExpData.pricePerPerson * selectedSeats;
        
        const reservationData = {
            experienceId: currentExpData._id,
            userId: user._id, // Asegúrate de que tu objeto user tenga _id
            seats: selectedSeats,
            total: total,
            status: 'pending' // O el estado inicial que use tu backend
        };

        // UI Feedback: Deshabilitar botón para evitar doble clic
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Procesando...';

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(reservationData)
            });

            if (res.ok) {
                alert('¡Reserva creada exitosamente!');
                document.getElementById('reservationModal').style.display = 'none';
                // Opcional: Redirigir a "Mis Reservas"
                // window.location.href = '/my-bookings.html';
            } else {
                const err = await res.json();
                alert(err.error || 'Error al crear la reserva');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión con el servidor');
        } finally {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Confirmar';
        }
    };
    
    // Cerrar modales
    const closeBtn = document.getElementById('closeReservationModal');
    if (closeBtn) closeBtn.onclick = () => {
        document.getElementById('reservationModal').style.display = 'none';
    };
    const cancelBtn = document.getElementById('btnCancelReservation');
    if (cancelBtn) cancelBtn.onclick = () => {
        document.getElementById('reservationModal').style.display = 'none';
    };

    // Cierra modal si haces clic fuera del contenido
    window.onclick = (event) => {
        const modal = document.getElementById('reservationModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- CARGAR RESEÑAS ---
    async function loadReviews(guideId) {
        // Implementación básica placeholder
        // Aquí deberías hacer fetch a /api/reviews?guideId=${guideId} o similar
        console.log("Cargando reseñas para guía:", guideId);
    }
});