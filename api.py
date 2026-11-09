from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models.producto import Electronico, Libro
from utils.validators import validar_numero, validar_texto
from utils.exceptions import ValidationError, NotFoundError

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

inventario = {}  
siguiente_id = 1

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

# Función perfectamente sincronizada con models/producto.py
def producto_to_dict(id, p):
    if isinstance(p, Electronico):
        categoria = "Electronico"
        extra = p.garantia_meses  # <--- Usamos el nombre exacto de tu propiedad
    else:
        categoria = "Libro"
        extra = p.autor

    return {
        "id": id,
        "nombre": p.nombre,
        "precio_base": p.precio_base, # <--- Usamos precio_base
        "stock": p.stock,
        "precio_final": p.calcular_precio_final(),
        "categoria": categoria,
        "extra": extra
    }

@app.route('/api/productos', methods=['GET'])
def get_productos():
    try:
        lista = [producto_to_dict(k, v) for k, v in inventario.items()]
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos', methods=['POST'])
def add_producto():
    global siguiente_id
    data = request.json
    try:
        categoria = data.get('categoria')
        nombre = validar_texto(str(data.get('nombre')), "Nombre")
        precio = validar_numero(str(data.get('precio')), float, 0.01)
        stock = validar_numero(str(data.get('stock')), int, 0)

        if categoria == "Electronico":
            garantia = validar_numero(str(data.get('extra')), int, 0, 120)
            producto = Electronico(nombre, precio, stock, garantia)
        elif categoria == "Libro":
            autor = validar_texto(str(data.get('extra')), "Autor")
            producto = Libro(nombre, precio, stock, autor)
        else:
            return jsonify({"error": "Categoría inválida"}), 400

        inventario[siguiente_id] = producto
        res = producto_to_dict(siguiente_id, producto)
        siguiente_id += 1
        
        return jsonify(res), 201
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400 
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route('/api/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    try:
        if id in inventario:
            del inventario[id]
            return jsonify({"mensaje": "Producto eliminado"}), 200
        return jsonify({"error": "Producto no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Servidor API corriendo en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)