document.addEventListener('DOMContentLoaded', () => {
    // Variable global para guardar los archivos que vienen del servidor
    let todosLosArchivos = [];

    // Función principal para traer los datos desde MongoDB
    function cargarArchivos() {
        fetch('/archivos')
            .then(response => response.json())
            .then(archivos => {
                todosLosArchivos = archivos; // Guardamos una copia en memoria
                renderizarLista(todosLosArchivos); // Los dibujamos en pantalla
            })
            .catch(err => console.error('Error cargando archivos:', err));
    }

    // Función encargada de dibujar los elementos en el HTML
    function renderizarLista(archivosAFiltrar) {
        const lista = document.getElementById('lista-archivos');
        if (!lista) return;
        
        lista.innerHTML = ''; // Limpiamos la lista para evitar duplicados

        if (archivosAFiltrar.length === 0) {
            lista.innerHTML = '<p style="text-align:center; color:#94a3b8; margin-top: 1.5rem;">No hay archivos en esta categoría ✨</p>';
            return;
        }

        archivosAFiltrar.forEach(archivo => {
            const li = document.createElement('li');
            
            // Comprobamos si el archivo es una imagen por su extensión
            const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(archivo.nombre);
            
            // Creamos el diseño del elemento de la lista
            li.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0;">
                        ${esImagen 
                            ? `<img src="${archivo.url}" alt="${archivo.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; flex-shrink: 0;">`
                            : `<div style="width: 50px; height: 50px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #64748b; font-size: 1.2rem; flex-shrink: 0;">📄</div>`
                        }
                        <a href="${archivo.url}" target="_blank" style="color: #475a75; text-decoration: none; font-weight: 500; word-break: break-all;">${archivo.nombre}</a>
                    </div>
                    <span style="font-size: 0.75rem; background: #e0eafc; color: #475a75; padding: 0.3rem 0.6rem; border-radius: 20px; font-weight: 600; white-space: nowrap;">
                        ${archivo.categoria}
                    </span>
                </div>
            `;
            
            lista.appendChild(li);
        });
    }

    // Función global que se activa al hacer clic en los botones de filtro del HTML
    window.filtrarArchivos = function(categoriaSeleccionada) {
        // 1. Cambiar el diseño visual del botón activo
        const botones = document.querySelectorAll('.btn-filtro');
        botones.forEach(btn => btn.classList.remove('activo'));
        
        // Buscamos el botón al que se le hizo clic para ponerle la clase 'activo'
        const botonActivo = Array.from(botones).find(btn => btn.textContent.includes(categoriaSeleccionada));
        if (botonActivo) botonActivo.classList.add('activo');

        // 2. Filtrar los datos en memoria
        if (categoriaSeleccionada === 'Todos') {
            renderizarLista(todosLosArchivos);
        } else {
            const archivosFiltrados = todosLosArchivos.filter(arc => arc.categoria === categoriaSeleccionada);
            renderizarLista(archivosFiltrados);
        }
    };

    // Inicializamos la carga de archivos al abrir la página
    cargarArchivos();
});