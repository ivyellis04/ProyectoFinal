// Capitalizar texto
function capitalizarTexto(texto) {
    return texto.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Variables
let canciones = JSON.parse(localStorage.getItem('canciones')) || [];
let idCancion = canciones.length ? canciones[canciones.length - 1].id + 1 : 0;

// Elementos DOM
const nombreInput = document.getElementById('nombre-cancion');
const artistaInput = document.getElementById('artista');
const generoInput = document.getElementById('genero');
const linkInput = document.getElementById('link-cancion');
const listaCanciones = document.getElementById('lista-canciones');
const btnAgregar = document.getElementById('btn-agregar');

// Cargar canciones desde una API externa
function cargarCancionesExterna() {
    fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=music&type=video&key=YOUR_API_KEY')
        .then(response => response.json())
        .then(data => {
            canciones = data.items.map((item, index) => ({
                id: index + idCancion,
                nombre: capitalizarTexto(item.snippet.title),
                artista: capitalizarTexto(item.snippet.channelTitle),
                genero: 'Desconocido', 
                link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                favorita: false
            }));
            idCancion += canciones.length;
            localStorage.setItem('canciones', JSON.stringify(canciones));
            mostrarCanciones();
        })
        .catch(error => {
            console.error('Error al cargar canciones de la API', error);
        });
}

// Función para agregar una canción
function agregarCancion() {
    const nombre = capitalizarTexto(nombreInput.value.trim());
    const artista = capitalizarTexto(artistaInput.value.trim());
    const genero = capitalizarTexto(generoInput.value.trim());
    const link = linkInput.value.trim();

    if (nombre === "" || artista === "" || genero === "" || link === "") {
        mostrarMensaje("Por favor, completá todos los campos.", "error");
        return;
    }

    const videoId = link.includes('v=') ? link.split('v=')[1] : null;
    if (!videoId) {
        mostrarMensaje("El enlace no es válido.", "error");
        return;
    }

    player.loadVideoById(videoId); // Cargar y reproducir el video en el reproductor

    const nuevaCancion = {
        id: idCancion++,
        nombre: nombre,
        artista: artista,
        genero: genero,
        link: link,
        favorita: false
    };

    canciones.push(nuevaCancion);
    localStorage.setItem('canciones', JSON.stringify(canciones));

    mostrarCanciones();

    // Limpiar inputs
    nombreInput.value = '';
    artistaInput.value = '';
    generoInput.value = '';
    linkInput.value = '';

    mostrarMensaje(`¡Qué buena la canción "${nombre}" de ${artista}!`, "exito");
}

// Mostrar las canciones en la lista
function mostrarCanciones() {
    listaCanciones.innerHTML = '';

    canciones.forEach(cancion => {
        let li = document.createElement('li');
        li.textContent = `${cancion.nombre} - ${cancion.artista} [${cancion.genero}]`;
        li.style.color = 'white';  // Asegurarse de que el color de las canciones sea visible

        let linkCancion = document.createElement('a');
        linkCancion.href = cancion.link;
        linkCancion.textContent = ' Escuchar';
        linkCancion.target = '_blank';
        li.appendChild(linkCancion);

        let btnFavorita = document.createElement('button');
        btnFavorita.textContent = cancion.favorita ? 'No Fav' : 'Fav';
        btnFavorita.classList.add('btn-favorita');
        btnFavorita.onclick = function () {
            cancion.favorita = !cancion.favorita;
            localStorage.setItem('canciones', JSON.stringify(canciones));
            mostrarCanciones();
        };

        let btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = function () {
            canciones = canciones.filter(c => c.id !== cancion.id);
            localStorage.setItem('canciones', JSON.stringify(canciones));
            mostrarCanciones();
        };

        let acciones = document.createElement('div');
        acciones.classList.add('btn-acciones');
        acciones.appendChild(btnFavorita);
        acciones.appendChild(btnEliminar);

        li.appendChild(acciones);
        listaCanciones.appendChild(li);
    });
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const divMensaje = document.createElement('div');
    divMensaje.textContent = mensaje;
    divMensaje.classList.add(tipo === "error" ? 'mensaje-error' : 'mensaje-exito');

    document.querySelector('.container').insertBefore(divMensaje, document.getElementById('formulario-contenedor'));

    setTimeout(() => {
        divMensaje.remove();
    }, 3000);
}

// Reproductor de YouTube
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '', // ID del video de YouTube
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Puedes agregar funciones aquí si necesitas controlar el reproductor cuando esté listo
}

// Event listener para agregar una canción
btnAgregar.addEventListener('click', agregarCancion);

// Cargar canciones desde la API externa al iniciar
cargarCancionesExterna();

// Mostrar canciones al iniciar la página
mostrarCanciones();

// Función de sugerencias
const sugerenciasCanciones = document.getElementById('sugerencias-canciones');
const baseCanciones = [
    'Blinding Lights - The Weeknd',
    'Shape of You - Ed Sheeran',
    'Levitating - Dua Lipa',
    'Someone Like You - Adele',
    'Bad Guy - Billie Eilish',
    'Drivers License - Olivia Rodrigo',
    'Rolling in the Deep - Adele'
];

// Función para actualizar las sugerencias en el datalist
function actualizarSugerencias(valor) {
    sugerenciasCanciones.innerHTML = '';

    const sugerenciasFiltradas = baseCanciones.filter(cancion =>
        cancion.toLowerCase().includes(valor.toLowerCase())
    );

    sugerenciasFiltradas.slice(0, 4).forEach(cancion => {
        const option = document.createElement('option');
        option.value = cancion;
        sugerenciasCanciones.appendChild(option);
    });
}

// Event listener para actualizar las sugerencias mientras el usuario escribe
nombreInput.addEventListener('input', (e) => {
    const valor = e.target.value.trim();
    if (valor) {
        actualizarSugerencias(valor);
    }
});
