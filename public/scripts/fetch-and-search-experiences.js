//Buscador
        // Referencias
          const searchInput = document.getElementById('searchInput');
          const dateInput = document.getElementById('dateInput');
          const peopleInput = document.getElementById('peopleInput');
          const activityInput = document.getElementById('activityInput');
          const btnSearch = document.getElementById('btnSearch');

          // Función principal de búsqueda
          const performSearch = () => {
            const filters = {
                search: searchInput?.value.trim(),
                date: dateInput?.value,
                people: peopleInput?.value,
                activity: activityInput?.value
            };
            fetchExperiences(filters);
        };

          // Listeners: Buscar cuando el usuario interactúe
          // Debounce para el texto (esperar a que termine de escribir)
          let debounceTimer;
          if(searchInput) {
              searchInput.addEventListener('input', () => {
                  clearTimeout(debounceTimer);
                  debounceTimer = setTimeout(performSearch, 400); 
              });
          }

          // Búsqueda inmediata al cambiar fecha, actividad o personas
          if(dateInput) dateInput.addEventListener('change', performSearch);
          if(activityInput) activityInput.addEventListener('change', performSearch);
          if(peopleInput) peopleInput.addEventListener('change', performSearch);

          // Carga inicial (sin filtros)
          performSearch();

          // Referencia al botón
          const btnClear = document.getElementById('btnClear');

          // Listener para borrar
          if (btnClear) {
              btnClear.addEventListener('click', () => {
                  // 1. Resetear valores de los inputs
                  if(searchInput) searchInput.value = '';
                  if(dateInput) dateInput.value = '';
                  if(peopleInput) peopleInput.value = '';
                  if(activityInput) activityInput.value = ''; // Vuelve a la opción por defecto

                  // 2. Ejecutar la búsqueda de nuevo (sin filtros)
                  // Esto recargará todas las experiencias originales
                  if (typeof performSearch === 'function') {
                      performSearch();
                  }
              });
          }

    //Cargar experiencias
    async function fetchExperiences(filters = {}) {
          try {
            // 1. Construir los parámetros URL dinámicamente
            const params = new URLSearchParams();
            
            // Solo agregamos al URL lo que tenga valor
            if (filters.search) params.append('search', filters.search);
            if (filters.date) params.append('startDate', filters.date); // Coincide con backend
            if (filters.people) params.append('people', filters.people);
            if (filters.activity) params.append('activity', filters.activity);

            // 2. Fetch al backend
            const res = await fetch(`/api/experiences?${params.toString()}`);
            
            if (!res.ok) throw new Error('Error en la petición');

            const data = await res.json();
            const container = document.getElementById('experiencesContainer');
            container.innerHTML = ''; // Limpiar contenedor

            // 3. Manejo de "Sin Resultados"
            if (!data.length) {
              container.innerHTML = `
                <div style="text-align:center; width:100%; grid-column: 1 / -1; padding: 40px;">
                    <h3> No encontramos resultados</h3>
                    <p>Intenta cambiar las fechas o quitar algunos filtros.</p>
                </div>
              `;
              return;
            }

            // 4. Renderizar Tarjetas
            data.forEach(exp => {
              const card = document.createElement('div');
              card.className = 'experience-card';
              
              // Imagen por defecto si no hay
              const imageUrl = exp.photos && exp.photos.length > 0 ? exp.photos[0] : 'https://via.placeholder.com/280x180';
              
              // Formato de Fecha (ej: 25 Dic)
              const dateObj = new Date(exp.date);
              const dateStr = dateObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric'});

              // HTML estilo Airbnb
              card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imageUrl}" alt="${exp.title}">
                    <span class="card-badge">${exp.activity}</span>
                </div>
                <div class="content">
                  <div class="card-header">
                    <h3>${exp.title}</h3>
                  </div>
                  <p class="location">${exp.location}</p>
                  <p class="date">${dateStr}</p>
                  <div class="price-row">
                    <span class="price"><strong>$${exp.pricePerPerson}</strong> <small>${exp.currency}</small></span>
                    <span class="per-person">por persona</span>
                  </div>
                </div>
              `;

              
              //Abrir experiencia al picarle al card
              card.addEventListener('click', () => {
                if(typeof openExperienceModal === 'function') openExperienceModal(exp._id);
              });
            

              container.appendChild(card);
            });
          } catch (err) {
            console.error("Error cargando experiencias:", err);
          }
        }

