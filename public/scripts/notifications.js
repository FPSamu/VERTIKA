//Funciones auxiliares notificaciones
// --- FUNCIONES AUXILIARES ---

// Función para actualizar la campana (Badge)
function updateBellBadge(show) {
  const bell = document.getElementById("notifIcon");
  let badge = bell.querySelector(".notif-badge");

  if (show) {
    if (!badge) {
      badge = document.createElement("span");
      badge.classList.add("notif-badge"); // Asegúrate de tener CSS para este badge (puntito rojo)
      bell.appendChild(badge);
    }
  } else {
    if (badge) badge.remove();
  }
}

// Función para crear el elemento de lista de la notificación
function createNotificationItem(notif) {
  const li = document.createElement("li");
  li.classList.add("notif-item");
  li.style.cursor = "pointer";
  li.style.display = "flex"; // Usar flex para alinear texto y X
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";

  // Contenedor izquierdo (Punto azul + Texto)
  const leftContainer = document.createElement("div");
  leftContainer.style.display = "flex";
  leftContainer.style.alignItems = "center";

  // 1. Lógica del Círculo Azul (Si no está leída)
  if (!notif.read) {
    li.classList.add("unread");
    const dot = document.createElement("span");
    dot.classList.add("unread-dot");
    // Estilos inline por si faltan en CSS
    dot.style.height = "10px";
    dot.style.width = "10px";
    dot.style.backgroundColor = "#007bff";
    dot.style.borderRadius = "50%";
    dot.style.display = "inline-block";
    dot.style.marginRight = "8px";
    leftContainer.appendChild(dot);
  }

  const content = document.createElement("span");
  content.textContent = notif.message;
  leftContainer.appendChild(content);

  // 2. Botón de Eliminar (X)
  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;"; // Símbolo de multiplicación (X)
  closeBtn.style.fontSize = "20px";
  closeBtn.style.color = "#999";
  closeBtn.style.marginLeft = "10px";
  closeBtn.style.padding = "0 5px";
  closeBtn.style.fontWeight = "bold";
  closeBtn.title = "Eliminar";

  // --- LOGICA DE ELIMINAR ---
  closeBtn.addEventListener("click", async (e) => {
    // IMPORTANTE: Detiene que el click llegue al LI (evita redirección)
    e.stopPropagation();

    // 1. Eliminación visual inmediata (UX rápida)
    li.remove();

    // 2. Verificar si quedó vacía la lista
    const list = document.getElementById("notificationsList");
    if (list && list.children.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.textContent = "No tienes notificaciones";
      list.appendChild(emptyLi);
      updateBellBadge(false);
    } else {
      // Re-checar si quedan no leídas para el badge
      checkUnreadStatusInList();
    }

    // 3. Petición al Backend para borrar de DB
    try {
      const token = localStorage.getItem("accessToken");
      // Asumiendo que tienes una ruta DELETE /api/notifications/:id
      await fetch(`/api/notifications/${notif._id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (err) {
      console.error("Error eliminando notificación", err);
    }
  });

  // Agregar contenedores al LI
  li.appendChild(leftContainer);
  li.appendChild(closeBtn);

  // 2. Evento Click: Marcar como leída y navegar
  li.addEventListener("click", async (e) => {
    // Si no está leída, marcarla en el backend
    if (!notif.read) {
      try {
        const token = localStorage.getItem("accessToken");
        // Llamamos al endpoint markAsRead que ya tienes en el backend
        await fetch(`/api/notifications/${notif._id}/read`, {
          method: "PATCH",
          headers: { Authorization: "Bearer " + token },
        });

        // Actualizar UI visualmente (quitar punto azul)
        li.classList.remove("unread");
        const dot = li.querySelector(".unread-dot");
        if (dot) dot.remove();
        notif.read = true; // Actualizar estado local

        // Opcional: Re-checar si quedan notificaciones sin leer para quitar el badge de la campana
        checkUnreadStatusInList();
      } catch (error) {
        console.error("Error al marcar como leída", error);
      }
    }

    if (notif.type === "reservation") {
      // Redirigir a detalles de la reserva
      window.location.href = `/api/reservations/view/${notif.data.reservationId}`;
    }
  });

  return li;
}

// Función para revisar si quedan elementos sin leer en la lista visual actual
function checkUnreadStatusInList() {
  const list = document.getElementById("notificationsList");
  const unreadItems = list.querySelectorAll(".notif-item.unread");
  // Si ya no hay items con clase unread, quitamos el badge de la campana
  if (unreadItems.length === 0) {
    updateBellBadge(false);
  }
}
