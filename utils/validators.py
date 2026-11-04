"""Validaciones para las entradas del menú CLI."""
import math
from utils.exceptions import ValidationError


def validar_numero(valor: str, tipo=float, min_val=0, max_val=None):
    """Convierte y valida un número dentro de un rango inclusivo."""
    try:
        numero = tipo(valor)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValidationError(f"Formato numérico inválido: {valor}") from exc
    if isinstance(numero, float) and not math.isfinite(numero):
        raise ValidationError("El valor debe ser finito.")
    if numero < min_val or (max_val is not None and numero > max_val):
        raise ValidationError(f"Valor fuera de rango: mínimo {min_val}, máximo {max_val}.")
    return numero


def validar_categoria(categoria: str) -> str:
    """Normaliza una categoría válida."""
    clave = categoria.strip().lower()
    if clave in ("1", "electronico", "electrónico"):
        return "Electronico"
    if clave in ("2", "libro"):
        return "Libro"
    raise ValidationError("Categoría inválida: elige 1 o 2.")


def validar_texto(texto: str, campo: str) -> str:
    """Comprueba que el usuario escribió algo."""
    if not texto.strip():
        raise ValidationError(f"{campo} no puede estar vacío.")
    return texto.strip()
