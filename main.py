"""Orquestador CLI del Sistema de Gestión de Productos (UNCP)."""
from models.producto import Electronico, Libro
from utils.validators import validar_numero, validar_categoria, validar_texto
from utils.exceptions import ValidationError, NotFoundError


def menu() -> str:
    print("\n=== GESTIÓN DE PRODUCTOS (CLI) ===")
    print("1. Agregar producto")
    print("2. Listar productos")
    print("3. Calcular precio final")
    print("4. Salir")
    return input("Opción: ").strip()


def agregar_producto(inventario: dict, siguiente_id: int) -> int:
    print("\nCategorías: 1. Electrónico | 2. Libro")
    categoria = validar_categoria(input("Categoría: "))
    nombre = validar_texto(input("Nombre: "), "Nombre")
    precio = validar_numero(input("Precio base (S/): "), float, 0.01)
    stock = validar_numero(input("Stock: "), int, 0)
    if categoria == "Electronico":
        garantia = validar_numero(input("Garantía (meses): "), int, 0, 120)
        producto = Electronico(nombre, precio, stock, garantia)
    else:
        autor = validar_texto(input("Autor: "), "Autor")
        producto = Libro(nombre, precio, stock, autor)
    inventario[siguiente_id] = producto
    print(f"Producto agregado correctamente con ID {siguiente_id}.")
    return siguiente_id + 1


def listar_productos(inventario: dict) -> None:
    if not inventario:
        print("El inventario está vacío.")
        return
    print("\n--- INVENTARIO ---")
    for identificador, producto in inventario.items():
        print(f"ID {identificador} | {producto}")


def buscar_producto(inventario: dict, identificador: int):
    if identificador not in inventario:
        raise NotFoundError(f"No existe un producto con ID {identificador}.")
    return inventario[identificador]


def consultar_precio(inventario: dict) -> None:
    identificador = validar_numero(input("ID del producto: "), int, 1)
    producto = buscar_producto(inventario, identificador)
    print(f"Producto: {producto.nombre}")
    print(f"Precio final: S/ {producto.calcular_precio_final():.2f}")


def main() -> None:
    inventario = {}  # ID -> objeto Producto
    siguiente_id = 1
    while True:
        try:
            opcion = menu()
            if opcion == "1":
                siguiente_id = agregar_producto(inventario, siguiente_id)
            elif opcion == "2":
                listar_productos(inventario)
            elif opcion == "3":
                consultar_precio(inventario)
            elif opcion == "4":
                print("Cerrando sistema...")
                break
            else:
                raise ValidationError("Opción inválida. Elige entre 1 y 4.")
        except ValidationError as error:
            print(f"Error de validación: {error}")
        except NotFoundError as error:
            print(f"No encontrado: {error}")
        except (EOFError, KeyboardInterrupt):
            print("\nSalida solicitada por el usuario.")
            break
        else:
            print("Operación procesada sin excepciones.")
        finally:
            print("--- Fin de la operación ---")


if __name__ == "__main__":
    main()
