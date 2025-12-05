// Lógica del Modal
    const modal = document.getElementById('guideModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitGuideBtn = document.getElementById('submitGuideBtn');
    const languageInput = document.getElementById('languageInput');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    const languageTags = document.getElementById('languageTags');
    const specialtyInput = document.getElementById('specialtyInput');
    const addSpecialtyBtn = document.getElementById('addSpecialtyBtn');
    const specialtyTags = document.getElementById('specialtyTags');

    let languages = ['Español']; // Idioma por defecto
    let specialties = [];

    // Mostrar idioma por defecto
    updateLanguageTags();

    function updateLanguageTags() {
      languageTags.innerHTML = '';
      languages.forEach((lang, index) => {
        const tag = document.createElement('div');
        tag.className = 'language-tag';
        tag.innerHTML = `
          ${lang}
          <span class="remove-tag" data-index="${index}">&times;</span>
        `;
        languageTags.appendChild(tag);
      });

      // Event listeners para remover idiomas
      document.querySelectorAll('.language-tag .remove-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'));
          languages.splice(index, 1);
          updateLanguageTags();
        });
      });
    }

    function updateSpecialtyTags() {
      specialtyTags.innerHTML = '';
      specialties.forEach((spec, index) => {
        const tag = document.createElement('div');
        tag.className = 'specialty-tag';
        tag.innerHTML = `
          ${spec}
          <span class="remove-tag" data-index="${index}">&times;</span>
        `;
        specialtyTags.appendChild(tag);
      });

      // Event listeners para remover especialidades
      document.querySelectorAll('.specialty-tag .remove-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'));
          specialties.splice(index, 1);
          updateSpecialtyTags();
        });
      });
    }

    // Agregar idioma
    addLanguageBtn.addEventListener('click', () => {
      const lang = languageInput.value.trim();
      if (lang && !languages.includes(lang)) {
        languages.push(lang);
        updateLanguageTags();
        languageInput.value = '';
      }
    });

    // Agregar idioma con Enter
    languageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLanguageBtn.click();
      }
    });

    // Agregar especialidad
    addSpecialtyBtn.addEventListener('click', () => {
      const spec = specialtyInput.value.trim();
      if (spec && !specialties.includes(spec)) {
        specialties.push(spec);
        updateSpecialtyTags();
        specialtyInput.value = '';
      }
    });

    // Agregar especialidad con Enter
    specialtyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSpecialtyBtn.click();
      }
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Cerrar modal al hacer click fuera de él
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });



    // Enviar solicitud de guía
    submitGuideBtn.addEventListener('click', async () => {
      const bio = document.getElementById('guideBio').value.trim();
      const experienceYears = document.getElementById('guideExperienceYears').value;

      // Validaciones
      if (!bio) {
        alert('Por favor ingresa una biografía');
        return;
      }

      if (!experienceYears || experienceYears < 0) {
        alert('Por favor ingresa años de experiencia válidos');
        return;
      }

      if (languages.length === 0) {
        alert('Por favor agrega al menos un idioma');
        return;
      }

      let token = await getValidToken();
      console.log('Token encontrado:', token ? 'Sí' : 'No');

      if (!token) {
        alert('Sesion Expirada. Debes iniciar sesión otra vez.');
        return;
      }

      console.log('Enviando datos:', { bio, experienceYears: parseInt(experienceYears), languages, specialties });

      try {
        let res = await fetch('/api/auth/request-guide', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bio,
            experienceYears: parseInt(experienceYears),
            languages,
            specialties
          })
        });

        console.log('Status de respuesta:', res.status);

        // Si el token expiró, intentar refrescarlo y reintentar
        if (res.status === 401) {
          console.log('Token expirado, intentando refrescar...');
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Reintentar con el nuevo token
            res = await fetch('/api/auth/request-guide', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + newToken,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                bio,
                experienceYears: parseInt(experienceYears),
                languages,
                specialties
              })
            });
          } else {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            localStorage.clear();
            window.location.href = '/api/auth/login';
            return;
          }
        }

        if (res.ok) {
          const data = await res.json();
          console.log('Respuesta exitosa:', data);
          alert('¡Solicitud enviada exitosamente! Ahora eres guía.');

          // Actualizar usuario en localStorage
          const user = JSON.parse(localStorage.getItem('user'));
          user.roles = data.data.user.roles;
          localStorage.setItem('user', JSON.stringify(user));

          // Recargar página para actualizar navbar
          window.location.reload();
        } else {
          const error = await res.json();
          console.error('Error de servidor:', error);
          alert(error.message || 'Error al solicitar ser guía');
        }
      } catch (err) {
        console.error('Error en la petición:', err);
        alert('Error al procesar la solicitud: ' + err.message);
      }
    });
