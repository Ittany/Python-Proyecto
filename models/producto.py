"""Modelos orientados a objetos del inventario."""
from utils.exceptions import ValidationError


class Producto:
    """Clase base con atributos encapsulados."""

    def __init__(self, nombre: str, precio_base: float, stock: int):
        self.nombre = nombre
        self.precio_base = precio_base
        self.stock = stock

    @property
    def nombre(self) -> str:
        return self.__nombre

    @nombre.setter
    def nombre(self, valor: str) -> None:
        if not isinstance(valor, str) or not valor.strip():
            raise ValidationError("El nombre no puede estar vacío.")
        self.__nombre = valor.strip()

    @property
    def precio_base(self) -> float:
        return self.__precio_base

    @precio_base.setter
    def precio_base(self, valor: float) -> None:
        if isinstance(valor, bool) or not isinstance(valor, (int, float)) or not 0 < valor < float('inf'):
            raise ValidationError("El precio debe ser un número positivo y finito.")
        self.__precio_base = float(valor)

    @property
    def stock(self) -> int:
        return self.__stock

    @stock.setter
    def stock(self, valor: int) -> None:
        if isinstance(valor, bool) or not isinstance(valor, int) or valor < 0:
            raise ValidationError("El stock debe ser un entero no negativo.")
        self.__stock = valor

    def calcular_precio_final(self) -> float:
        raise NotImplementedError("Las subclases implementan este método.")

    def __str__(self) -> str:
        return (f"{self.__class__.__name__}: {self.nombre} | "
                f"Base: S/ {self.precio_base:.2f} | Stock: {self.stock}")

    def __del__(self):
        """Método de ciclo de vida; no se usa para liberar recursos."""
        pass


class Electronico(Producto):
    """Electrónico: descuento de 5 % cuando el stock supera 50."""

    def __init__(self, nombre: str, precio_base: float, stock: int,
                 garantia_meses: int):
        super().__init__(nombre, precio_base, stock)
        self.garantia_meses = garantia_meses

    @property
    def garantia_meses(self) -> int:
        return self._garantia_meses

    @garantia_meses.setter
    def garantia_meses(self, valor: int) -> None:
        if isinstance(valor, bool) or not isinstance(valor, int) or not 0 <= valor <= 120:
            raise ValidationError("La garantía debe estar entre 0 y 120 meses.")
        self._garantia_meses = valor

    def calcular_precio_final(self) -> float:
        return round(self.precio_base * (0.95 if self.stock > 50 else 1), 2)

    def __str__(self) -> str:
        return f"{super().__str__()} | Garantía: {self.garantia_meses} meses"


class Libro(Producto):
    """Libro: precio base menos 10 % en esta simulación."""

    def __init__(self, nombre: str, precio_base: float, stock: int,
                 autor: str):
        super().__init__(nombre, precio_base, stock)
        self.autor = autor

    @property
    def autor(self) -> str:
        return self.__autor

    @autor.setter
    def autor(self, valor: str) -> None:
        if not isinstance(valor, str) or not valor.strip():
            raise ValidationError("El autor no puede estar vacío.")
        self.__autor = valor.strip()

    def calcular_precio_final(self) -> float:
        return round(self.precio_base * 0.90, 2)

    def __str__(self) -> str:
        return f"{super().__str__()} | Autor: {self.autor}"
