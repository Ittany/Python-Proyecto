const API_URL = 'http://127.0.0.1:5000/api/productos';

function actualizarEstadoAPI(isConnected) {
    const badge = document.getElementById('api-status');
    badge.style.display = 'block';
    
    if (isConnected) {
        badge.innerText = 'API Conectada';
        badge.className = 'badge-api connected';
    } else {
        badge.innerText = 'API Desconectada';
        badge.className = 'badge-api disconnected';
    }
}

function cambiarCamposExtra() {
    const categoria = document.getElementById('categoria').value;
    const labelExtra = document.getElementById('label-extra');
    const inputExtra = document.getElementById('extra');

    if (categoria === 'Electronico') {
        labelExtra.innerText = 'Garantía (meses)';
        inputExtra.type = 'number';
        inputExtra.placeholder = 'Ej. 12';
        inputExtra.value = '';
    } else {
        labelExtra.innerText = 'Autor del Libro';
        inputExtra.type = 'text';
        inputExtra.placeholder = 'Ej. Gabriel García Márquez';
        inputExtra.value = '';
    }
}

async function cargarProductos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error en la respuesta');
        
        const data = await res.json();
        actualizarEstadoAPI(true); 

        const tableBody = document.getElementById('table-body');

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay productos registrados en el inventario.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(p => {
            const catClass = p.categoria === 'Electronico' ? 'cat-elec' : 'cat-libro';
            
            // ARREGLO AQUÍ: Formateamos el texto de la garantía/autor
            let textoExtra = p.extra;
            if (p.categoria === 'Electronico') {
                textoExtra = `${p.extra} meses`;
            }
            
            const catText = p.categoria === 'Electronico' 
                ? `Electrónico (Garantía: ${textoExtra})` 
                : `Libro (${textoExtra})`;
            
            return `
                <tr>
                    <td>#${p.id}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td><span class="cat-badge ${catClass}">${catText}</span></td>
                    <td>S/ ${p.precio_final.toFixed(2)}</td>
                    <td>${p.stock} unds.</td>
                    <td><button class="btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        actualizarEstadoAPI(false); 
        document.getElementById('table-body').innerHTML = `<tr><td colspan="6" class="empty-state">Error: No se pudo conectar con el servidor Python.</td></tr>`;
    }
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
        categoria: document.getElementById('categoria').value,
        nombre: document.getElementById('nombre').value,
        extra: document.getElementById('extra').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value)
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        let data;
        try {
            data = await res.json();
        } catch (err) {
            data = { error: "El servidor devolvió un error inesperado." };
        }

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'El producto se registró correctamente.',
                confirmButtonColor: '#2563eb'
            });
            document.getElementById('product-form').reset();
            cambiarCamposExtra();
            cargarProductos();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo guardar',
                text: data.error || 'Revisa los datos ingresados',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (error) {
        Swal.fire('Error de red', 'No hay conexión con el servidor de Python.', 'error');
    }
});

async function eliminarProducto(id) {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Eliminado', 'El producto fue borrado.', 'success');
                    cargarProductos();
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        }
    });
}

cambiarCamposExtra();
cargarProductos();