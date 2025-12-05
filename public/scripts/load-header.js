// Este archivo debe cargarse DESPUÉS de:
// <script src="/socket.io/socket.io.js"></script>
// <script src="/static/scripts/notification.js"></script>

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // referencias a nodos (comprueba existencia)
    const userActions = document.getElementById('userActions');
    const mainNav = document.getElementById('mainNav');
    const navExperiences = document.getElementById('navExperiences');
    const navRequestGuide = document.getElementById('navRequestGuide');
    const navReservations = document.getElementById('navReservations');

    // si elementos clave no existen, abortamos silenciosamente para no romper la página
    if (!userActions || !mainNav || !navExperiences || !navRequestGuide || !navReservations) {
      console.warn('Elementos de la nav no encontrados — abortando inicialización de usuario.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');

    if (!user) {
      // Si no hay usuario, opcionalmente ocultar nav o dejar como está.
      mainNav.style.display = 'none';
      return;
    }

    // Mostrar navbar
    mainNav.style.display = 'flex';

    // Configurar opciones según roles
    const isGuide = Array.isArray(user.roles) && user.roles.includes('guide');

    if (isGuide) {
      navExperiences.style.display = 'block';
      navRequestGuide.style.display = 'none';
    } else {
      navExperiences.style.display = 'none';
      navRequestGuide.style.display = 'block';
    }

    // Avatar: fallback por defecto
    let avatarSrc = user.avatarUrl || 'https://ttwo.dk/wp-content/uploads/2017/08/person-placeholder.jpg';

    // Si no hay avatar en localStorage, pedirlo al backend (con timeout opcional)
    if (!user.avatarUrl) {
      try {
        const res = await fetch(`/api/users/${user._id}`, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
        if (res.ok) {
          const userData = await res.json();
          if (userData && userData.avatarUrl) avatarSrc = userData.avatarUrl;
        }
      } catch (e) {
        console.error('Error obteniendo avatar en caliente:', e);
      }
    }

    // Inyectar HTML del menú de usuario
    const userMenuHTML = `
      <div class="notif-icon" id="notifIcon" style="cursor:pointer; position: relative; margin-right: 15px;">
        <i class="fa-solid fa-bell"></i>
      </div>

      <div class="user-menu-container" id="userMenuTrigger" style="cursor:pointer; display:flex; align-items:center;">
        <span class="user-greeting">Hola, ${user.name}</span>
        <img src="${avatarSrc}" alt="Avatar" class="nav-avatar" onerror="this.src='https://ttwo.dk/wp-content/uploads/2017/08/person-placeholder.jpg'">
        <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; color: #777; margin-left:5px;"></i>

        <div class="dropdown-menu" id="userDropdown" style="display:none; position:absolute; right:0; background:#fff; box-shadow:0 4px 8px rgba(0,0,0,.1);">
          <a href="/api/auth/profile"> Mi Perfil</a>
          <a href="#" id="dropdownGuideLink" style="display:none; color: #667eea; font-weight: 600;">Mi Perfil de Guía</a>
          <div class="dropdown-divider"></div>
          <a href="#" id="dropdownLogout"> Cerrar Sesión</a>
        </div>
      </div>
    `;

    userActions.innerHTML = userMenuHTML;
    userActions.style.display = 'flex';

    // Eventos del dropdown (comprobar existencia antes)
    const trigger = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userDropdown');
    if (trigger && dropdown) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });

      // Cerrar al hacer click fuera
      document.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });
    }

    // Lógica específica de guía: buscar guía asociada y mostrar link
    if (isGuide) {
      try {
        const res = await fetch(`/api/guides/by-user/${user._id}`, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
        if (res.ok) {
          const data = await res.json();
          const guideLink = document.getElementById('dropdownGuideLink');
          if (data && data.guideId && guideLink) {
            guideLink.href = `/api/guides/profile/${data.guideId}`;
            guideLink.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Error buscando ID de guía:', err);
      }
    }

    // Navegación: proteger listeners con comprobación de nodos
    if (navReservations) {
      navReservations.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/api/reservations/my-reservations';
      });
    }

    if (navExperiences) {
      navExperiences.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/api/experiences/my-experiences';
      });
    }

    if (navRequestGuide) {
      navRequestGuide.addEventListener('click', (e) => {
        e.preventDefault();
        const guideModal = document.getElementById('guideModal');
        if (guideModal) guideModal.style.display = 'block';
      });
    }

    // Logout (comprobar que el boton exista)
    const logoutBtn = document.getElementById('dropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        const tokenLocal = localStorage.getItem('accessToken');
        if (tokenLocal) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { Authorization: 'Bearer ' + tokenLocal }
            });
          } catch (err) {
            console.error('Error en logout fetch:', err);
          }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/api';
      });
    }

    // Verificación inicial de notificaciones (si existe la función updateBellBadge)
    try {
      if (typeof updateBellBadge === 'function') {
        const response = await fetch(`/api/notifications/${user._id}`, {
          method: 'GET',
          headers: token ? { Authorization: 'Bearer ' + token } : {}
        });

        if (response.ok) {
          const notifications = await response.json();
          if (Array.isArray(notifications)) {
            const hasUnread = notifications.some(n => !n.read);
            updateBellBadge(Boolean(hasUnread));
          }
        }
      } else {
        console.warn('updateBellBadge no está definida (notification.js no cargado o expuesto).');
      }
    } catch (err) {
      console.error('Error verificando notificaciones iniciales:', err);
    }

    // Socket: asegurarse de que io está disponible
    if (typeof io === 'function') {
      const socket = io('/');
      socket.emit('join', user._id);

      socket.on('newNotification', (notif) => {
        console.log('Nueva notificación:', notif);
        const bell = document.getElementById('notifIcon');
        if (bell) {
          bell.classList.add('blink');
          setTimeout(() => bell.classList.remove('blink'), 2000);
          if (typeof updateBellBadge === 'function') updateBellBadge(true);
        }

        const list = document.getElementById('notificationsList');
        if (list && typeof createNotificationItem === 'function') {
          notif.read = false;
          const li = createNotificationItem(notif);
          list.prepend(li);
        }
      });
    } else {
      console.warn('Socket.IO client (io) no disponible. Asegúrate de incluir /socket.io/socket.io.js antes de este script.');
    }

    // Modal notificaciones: abrir y rellenar
    const notifIcon = document.getElementById('notifIcon');
    if (notifIcon) {
      notifIcon.addEventListener('click', async () => {
        const modal = document.getElementById('notificationsModal');
        const notificationsList = document.getElementById('notificationsList');

        if (!modal || !notificationsList) return;

        modal.style.display = 'block';

        try {
          const tokenLocal = localStorage.getItem('accessToken');
          const response = await fetch(`/api/notifications/${user._id}`, {
            method: 'GET',
            headers: tokenLocal ? { Authorization: 'Bearer ' + tokenLocal } : {}
          });

          if (!response.ok) {
            console.error('Error obteniendo notificaciones:', response.status);
            return;
          }

          const notifications = await response.json();
          notificationsList.innerHTML = '';

          if (Array.isArray(notifications) && notifications.length > 0) {
            const hasUnread = notifications.some(n => !n.read);
            if (typeof updateBellBadge === 'function') updateBellBadge(hasUnread);

            notifications.forEach(n => notificationsList.appendChild(createNotificationItem(n)));
          } else {
            const li = document.createElement('li');
            li.textContent = 'No tienes notificaciones';
            notificationsList.appendChild(li);
            if (typeof updateBellBadge === 'function') updateBellBadge(false);
          }

          // Cierre del modal
          const closeBtn = modal.querySelector('.close');
          if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
          window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };

        } catch (err) {
          console.error('Error llenando modal de notificaciones:', err);
        }
      });
    }

  } catch (err) {
    console.error('Error inicializando UI de usuario:', err);
  }
});