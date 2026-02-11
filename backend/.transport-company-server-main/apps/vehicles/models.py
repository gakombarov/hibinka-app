from django.db import models
from apps.common.models import IsDeletedModel

VEHICLE_CATEGORY_CHOICES = (
    ('BUS', 'Автобус'),
    ('MINIBUS', 'Микроавтобус'),
    ('BUS', 'Автобус'),
)

    
class Vehicle(IsDeletedModel):
    brand = models.CharField(
        max_length=50,
        verbose_name="Марка",
        help_text="Марка транспортного средства (например, Mercedes)"
    )
    model = models.CharField(
        max_length=50,
        verbose_name="Модель",
        help_text="Модель транспортного средства (например, Sprinter)"
    )
    year = models.IntegerField(
        verbose_name="Год выпуска",
        help_text="Год производства транспортного средства"
    )
    license_plate = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Гос. номер",
        help_text="Регистрационный номер транспортного средства"
    )
    capacity = models.IntegerField(
        verbose_name="Вместимость",
        help_text="Количество пассажирских мест"
    )
    category = models.CharField(
        max_length=50,
        choices=VEHICLE_CATEGORY_CHOICES,
        verbose_name="Категория",
        help_text="Тип транспортного средства"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активен",
        help_text="Доступен ли транспорт для использования"
    )

    class Meta:
        verbose_name = "Транспортное средство"
        verbose_name_plural = "Транспортные средства"

    def __str__(self):
        return f"{self.brand} {self.model} ({self.license_plate})"