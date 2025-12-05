/* static/scripts/experience-detail.js */

document.addEventListener('DOMContentLoaded', async () => {
    
    const mainContainer = document.getElementById('mainContainer');
    if (!mainContainer) return; 
    const experienceId = mainContainer.getAttribute('data-id');

    let currentExperience = null;
    let currentPhotos = [];
    let selectedSeats = 1;

    // Helper para asignar texto sin errores
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    // Referencias DOM fijas
    const dom = {
        title: document.getElementById('expTitle'),
        dateText: document.getElementById('expDateText'),
        gallery: document.getElementById('galleryGrid'),
        guideAvatar: document.getElementById('guideAvatar'),
        cardPrice: document.getElementById('cardPrice'),
        btnOpenRes: document.getElementById('btnOpenReservation')
    };

    // --- 1. CARGA DE DATOS ---
    async function fetchExperienceData() {
        try {
            const res = await fetch(`/api/experiences/${experienceId}`);
            if (!res.ok) throw new Error("Error cargando experiencia");
            
            const data = await res.json();
            currentExperience = data;
            currentPhotos = data.photos || [];

            renderExperience(data);

            const guideId = (data.guideId && typeof data.guideId === 'object') ? data.guideId._id : data.guideId;
            
            if (guideId) {
                fetchGuideDetails(guideId); 
                fetchGuideReviews(guideId);
            }

        } catch (err) {
            console.error(err);
            if(dom.title) dom.title.textContent = "Experiencia no encontrada";
            if(dom.btnOpenRes) {
                dom.btnOpenRes.disabled = true;
                dom.btnOpenRes.textContent = "No disponible";
            }
        }
    }

    async function fetchGuideDetails(guideId) {
        try {
            const res = await fetch(`/api/guides/${guideId}`); 
            
            if (res.ok) {
                const guideData = await res.json();
                if (guideData.user) {
                    setText('guideName', guideData.user.name || "Guía Vertika");
                    if (guideData.user.avatarUrl && dom.guideAvatar) {
                        dom.guideAvatar.src = guideData.user.avatarUrl;
                    } else if(dom.guideAvatar) {
                        dom.guideAvatar.src = "https://via.placeholder.com/60"; 
                    }
                }
            } else {
                // Fallback
                if (currentExperience && currentExperience.guideId && currentExperience.guideId.userId) {
                     const user = currentExperience.guideId.userId;
                     setText('guideName', user.name || "Anfitrión");
                     if(user.avatarUrl && dom.guideAvatar) dom.guideAvatar.src = user.avatarUrl;
                }
            }
        } catch (e) {
            console.warn("Error al cargar detalle del guía", e);
        }
    }

    async function fetchGuideReviews(guideId) {
        try {
            const res = await fetch(`/api/reviews?guideId=${guideId}`);
            if(res.ok) {
                const reviews = await res.json();
                renderReviews(reviews);
            }
        } catch (err) {
            console.error("Error reviews", err);
        }
    }

    // --- 2. RENDERIZADO ---
    function renderExperience(exp) {
        const dateObj = new Date(exp.date);
        const dateLong = dateObj.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const dateShort = dateObj.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const currency = exp.currency || 'MXN';
        const priceFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency }).format(exp.pricePerPerson);

        setText('expTitle', exp.title);
        setText('expLocation', exp.location);
        setText('expDescription', exp.description);
        setText('ratingVal', exp.rating ? exp.rating.toFixed(1) : 'Nuevo');
        
        setText('expDateText', dateLong);
        setText('expGroupSize', `${exp.minGroupSize || 1} - ${exp.maxGroupSize} personas`);
        setText('expActivity', exp.activity);
        setText('expDifficulty', exp.difficulty);

        setText('cardPrice', priceFmt);
        setText('cardDateShort', dateShort);
        setText('cardActivityShort', exp.activity);

        const badgeContainer = document.getElementById('modalBadges');
        if(badgeContainer) {
            badgeContainer.innerHTML = `
                <span class="badge-pill">${exp.activity}</span>
                <span class="badge-pill">${exp.difficulty}</span>
            `;
        }

        renderGallery(exp.photos);

        if (exp.booked && dom.btnOpenRes) {
            dom.btnOpenRes.disabled = true;
            dom.btnOpenRes.textContent = "Reservado";
            dom.btnOpenRes.style.background = "#ccc";
        }
    }

    function renderGallery(photos) {
        if(!dom.gallery) return;
        dom.gallery.innerHTML = ''; 
        
        const displayPhotos = photos && photos.length > 0 ? photos : ['https://via.placeholder.com/800x400?text=Sin+Imagen'];

        displayPhotos.slice(0, 5).forEach((url, idx) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Foto ${idx}`;
            img.onclick = () => openLightbox(idx); 
            dom.gallery.appendChild(img);
        });

        const btn = document.createElement('button');
        btn.className = 'btn-view-photos';
        btn.innerHTML = '<i class="fa fa-th"></i> Ver todas las fotos';
        btn.onclick = (e) => {
            e.stopPropagation();
            openLightbox(0);
        };
        dom.gallery.appendChild(btn);
    }

    async function renderReviews(reviews) {
        const container = document.getElementById('reviewsContainer');
        if(!container) return;
        container.innerHTML = ''; 

        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="no-reviews">Este guía aún no tiene reseñas. ¡Sé el primero!</p>';
            // Resetear stats usando setText para evitar errores
            setText('guideAvgRating', '-');
            setText('guideReviewCount', 'Sin calificaciones');
            return;
        }

        const avg = reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length;
        const avgDisplay = avg.toFixed(1);
        
        setText('guideAvgRating', avgDisplay);
        setText('guideReviewCount', `${reviews.length} reseñas`);
        
        const starsContainer = document.getElementById('guideRatingStars');
        if(starsContainer) starsContainer.innerHTML = '★'.repeat(Math.round(avg)).padEnd(5, '☆');

        const topReviews = reviews.slice(0, 5);

        for (const r of topReviews) {
            let userName = r.userName || 'Usuario';
            let avatarSrc = r.userAvatar || 'https://via.placeholder.com/40?text=U'; 
            
            const userId = r.userId || (r.user ? r.user._id : null);

            if (userId) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
                    const res = await fetch(`/api/users/${userId}`, { headers });
                    if (res.ok) {
                        const userData = await res.json();
                        const finalUser = userData.user || userData; 
                        if (finalUser.name) userName = finalUser.name;
                        if (finalUser.avatarUrl) avatarSrc = finalUser.avatarUrl;
                    }
                } catch (e) {
                    console.error('Error user data:', e);
                }
            }

            const div = document.createElement('div');
            div.className = 'review-card';
            const date = new Date(r.createdAt).toLocaleDateString('es-MX', {month:'long', year:'numeric'});
            
            div.innerHTML = `
                <div class="review-header">
                    <img src="${avatarSrc}" class="reviewer-img" alt="${userName}" onerror="this.src='https://via.placeholder.com/40?text=U'">
                    <div class="review-user-info">
                        <span class="review-user-name">${userName}</span>
                        <span class="review-date">${date}</span>
                    </div>
                    <div class="review-stars" style="margin-left: auto;">
                        ${'★'.repeat(r.rating || 5)}
                    </div>
                </div>
                <div class="review-comment">${r.comment}</div>
            `;
            container.appendChild(div);
        }
    }

    // --- 3. MODAL DE RESERVA ---
    const modal = document.getElementById('reservationModal');
    const closeBtn = document.getElementById('closeReservationModal');
    const cancelBtn = document.getElementById('btnCancelReservation');
    const confirmBtn = document.getElementById('btnConfirmReservation');
    const modalSeatsDisplay = document.getElementById('seatsDisplay');
    const modalTotal = document.getElementById('reservationTotal');
    const modalPricePerPerson = document.getElementById('reservationPricePerPerson');

    function openReservationModal() {
        const user = localStorage.getItem('user');
        if (!user) {
            alert("Debes iniciar sesión para reservar.");
            window.location.href = '/api/auth/login';
            return;
        }
        if (!currentExperience) return;

        selectedSeats = 1;
        updateModalCalculations();

        setText('reservationExpTitle', currentExperience.title);
        const dateStr = dom.dateText ? dom.dateText.textContent : 'Fecha no disponible';
        setText('reservationExpDate', dateStr);
        setText('reservationExpLocation', currentExperience.location);
        if(modalPricePerPerson) modalPricePerPerson.textContent = dom.cardPrice.textContent;
        
        const max = currentExperience.maxGroupSize || 10;
        setText('seatsAvailableLabel', `Cupo máximo: ${max} personas`);

        if(modal) modal.style.display = 'block';
    }

    function updateModalCalculations() {
        if (!currentExperience) return;
        const price = currentExperience.pricePerPerson;
        const total = price * selectedSeats;
        const currency = currentExperience.currency || 'MXN';
        const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency });

        if(modalSeatsDisplay) modalSeatsDisplay.textContent = selectedSeats;
        if(modalTotal) modalTotal.textContent = fmt.format(total);

        const btnDec = document.getElementById('decreaseSeats');
        const btnInc = document.getElementById('increaseSeats');
        if(btnDec) btnDec.disabled = (selectedSeats <= 1);
        if(btnInc) btnInc.disabled = (selectedSeats >= currentExperience.maxGroupSize);
    }

    if(dom.btnOpenRes) dom.btnOpenRes.addEventListener('click', openReservationModal);
    if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    if(cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });

    const btnInc = document.getElementById('increaseSeats');
    const btnDec = document.getElementById('decreaseSeats');

    if(btnInc) btnInc.addEventListener('click', () => {
        if (currentExperience && selectedSeats < currentExperience.maxGroupSize) {
            selectedSeats++;
            updateModalCalculations();
        }
    });

    if(btnDec) btnDec.addEventListener('click', () => {
        if (selectedSeats > 1) {
            selectedSeats--;
            updateModalCalculations();
        }
    });

    if(confirmBtn) confirmBtn.addEventListener('click', async () => {
        if (!currentExperience) return;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Procesando...";

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('accessToken');

            const payload = {
                experienceId: currentExperience._id,
                userId: user._id,
                seats: selectedSeats,
                total: selectedSeats * currentExperience.pricePerPerson,
                status: 'confirmed'
            };

            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                modal.style.display = 'none';
                alert(`¡Listo! Tu reserva está confirmada.`);
                window.location.href = '/api/reservations/my-reservations';
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || 'No se pudo completar la reserva'}`);
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión al servidor.");
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "Confirmar Reserva";
        }
    });

    // --- 5. LIGHTBOX ---
    window.openLightbox = (index) => {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxCounter');
        
        // Guardamos el índice actual
        let currentIndex = index;
        
        // Aseguramos que existan fotos
        const photos = currentPhotos.length > 0 ? currentPhotos : ['https://via.placeholder.com/800x400'];

        // Función interna para actualizar la imagen
        const updateImg = () => {
            img.src = photos[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${photos.length}`;
        };

        // Mostrar el lightbox
        if(lightbox) {
            lightbox.style.display = 'flex';
            updateImg();
        }

        // Referencias a botones
        const next = document.getElementById('lightboxNext');
        const prev = document.getElementById('lightboxPrev');
        const close = document.getElementById('lightboxClose');

        // Eventos de botones (con stopPropagation para que no cierren el modal)
        if(next) next.onclick = (e) => {
            e.stopPropagation(); 
            currentIndex = (currentIndex + 1) % photos.length;
            updateImg();
        };
        
        if(prev) prev.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + photos.length) % photos.length;
            updateImg();
        };
        
        if(close) close.onclick = () => lightbox.style.display = 'none';

        // --- AQUÍ ESTÁ EL ARREGLO ---
        // Asignamos el click al fondo negro (lightbox)
        lightbox.onclick = (e) => {
            // Si lo que clickeaste es EXACTAMENTE el fondo negro (y no la imagen)
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        };
    };

    // INICIALIZAR
    fetchExperienceData();
});