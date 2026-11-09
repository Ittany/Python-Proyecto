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

        // --- CÁLCULO DEL PRECIO ACUMULADO (Lógica de la Opción 3) ---
        let totalProductos = data.length;
        let totalStock = 0;
        let totalPrecioAcumulado = 0;

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay productos registrados en el catálogo.</td></tr>`;
        } else {
            tableBody.innerHTML = data.map(p => {
                totalStock += p.stock;
                totalPrecioAcumulado += (p.precio_final * p.stock); // Acumulamos valor

                const catClass = p.categoria === 'Electronico' ? 'cat-elec' : 'cat-libro';
                let textoExtra = p.categoria === 'Electronico' ? `${p.extra} meses` : p.extra;
                const catText = p.categoria === 'Electronico' 
                    ? `Electrónico (Garantía: ${textoExtra})` 
                    : `Libro (${textoExtra})`;
                
                return `
                    <tr>
                        <td>#${p.id}</td>
                        <td><strong>${p.nombre}</strong></td>
                        <td><span class="cat-badge ${catClass}">${catText}</span></td>
                        <td>
                            <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.85em; display: block;">S/ ${p.precio_base.toFixed(2)}</span>
                            <strong style="color: #0f172a;">S/ ${p.precio_final.toFixed(2)}</strong>
                        </td>
                        <td>${p.stock} unds.</td>
                        <td>
                            <!-- Botón para ver el cálculo (Opción 3 del CLI) -->
                            <button class="btn-delete" style="background:#e0e7ff; color:#3730a3; border:none; margin-right:5px;" onclick="verPrecio('${p.nombre}', ${p.precio_base}, ${p.precio_final}, ${p.stock})">Ver Precio</button>
                            <button class="btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Actualizamos los KPIs en el HTML
        document.getElementById('stat-productos').innerText = totalProductos;
        document.getElementById('stat-stock').innerText = totalStock;
        document.getElementById('stat-precio').innerText = `S/ ${totalPrecioAcumulado.toFixed(2)}`;

    } catch (error) {
        actualizarEstadoAPI(false); 
        document.getElementById('table-body').innerHTML = `<tr><td colspan="6" class="empty-state">Error: No se pudo conectar con el servidor Python.</td></tr>`;
    }
}

// Función para mostrar el desglose (Simula la Opción 3 del CLI)
function verPrecio(nombre, base, final, stock) {
    Swal.fire({
        title: `Cálculo de Precio: ${nombre}`,
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>Precio Base:</strong> S/ ${base.toFixed(2)}</p>
                <p><strong>Precio Final (con descuento):</strong> S/ ${final.toFixed(2)}</p>
                <p><strong>Stock Actual:</strong> ${stock} unidades</p>
                <hr style="margin: 10px 0;">
                <p><strong>Valor de este producto en almacén:</strong> <br> S/ ${(final * stock).toFixed(2)}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonColor: '#2563eb'
    });
}

// ... (El resto del código de submit y delete se mantiene igual) ...
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
        try { data = await res.json(); } catch (err) { data = { error: "Error inesperado." }; }

        if (res.ok) {
            Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Producto registrado.', confirmButtonColor: '#2563eb' });
            document.getElementById('product-form').reset();
            cambiarCamposExtra();
            cargarProductos();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Revisa los datos', confirmButtonColor: '#ef4444' });
        }
    } catch (error) {
        Swal.fire('Error de red', 'No hay conexión con el servidor.', 'error');
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
                Swal.fire('Error', 'No se pudo conectar', 'error');
            }
        }
    });
}

cambiarCamposExtra();
cargarProductos();