"""Errores propios del sistema de productos."""


class ValidationError(Exception):
    """Indica que un dato ingresado no es válido."""


class NotFoundError(Exception):
    """Indica que no existe un producto con el ID solicitado."""
