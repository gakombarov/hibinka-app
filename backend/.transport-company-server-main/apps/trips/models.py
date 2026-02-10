from django.db import models
from apps.bookings.models import Booking
from apps.customers.models import Customer
from apps.vehicles.models import Vehicle
from apps.drivers.models import DriverProfile
from apps.common.models import IsDeletedModel

PAYMENT_STATUS_CHOICES = (
    ('PENDING', 'Ожидает оплаты'),
    ('PAID', 'Оплачено'),
    ('PARTIAL', 'Частично оплачено'),
)

TRIP_STATUS_CHOICES = (
    ('PLANNED', 'Запланирована'),
    ('IN_PROGRESS', 'В пути'),
    ('COMPLETED', 'Завершена'),
    ('CANCELLED', 'Отменена'),
)


class Trip(IsDeletedModel):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trips',
        verbose_name="Бронирование",
        help_text="Связанное бронирование (если есть)"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='trips',
        verbose_name="Клиент",
        help_text="Клиент, для которого выполняется поездка"
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='trips',
        verbose_name="Транспортное средство",
        help_text="Транспорт, используемый для поездки"
    )
    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.CASCADE,
        related_name='trips',
        verbose_name="Водитель",
        help_text="Водитель, выполняющий поездку"
    )

    trip_date = models.DateField(
        verbose_name="Дата поездки",
        help_text="Дата выполнения поездки"
    )
    departure_time = models.TimeField(
        verbose_name="Время отправления",
        help_text="Время начала поездки"
    )
    departure_location = models.CharField(
        max_length=255,
        verbose_name="Место отправления",
        help_text="Адрес или название точки отправления"
    )
    arrival_location = models.CharField(
        max_length=255,
        verbose_name="Место прибытия",
        help_text="Адрес или название пункта назначения"
    )
    passenger_count = models.IntegerField(
        verbose_name="Количество пассажиров",
        help_text="Фактическое количество пассажиров"
    )

    planned_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Плановая сумма",
        help_text="Запланированная стоимость поездки (в рублях)"
    )
    actual_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Фактическая сумма",
        help_text="Итоговая стоимость после выполнения (в рублях)"
    )
    payment_status = models.CharField(
        max_length=50,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING',
        verbose_name="Статус оплаты",
        help_text="Текущий статус оплаты поездки"
    )
    status = models.CharField(
        max_length=50,
        choices=TRIP_STATUS_CHOICES,
        default='PLANNED',
        verbose_name="Статус поездки",
        help_text="Текущий статус выполнения поездки"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Примечания",
        help_text="Дополнительные заметки о поездке"
    )

    class Meta:
        verbose_name = "Поездка"
        verbose_name_plural = "Поездки"
        ordering = ['-trip_date', '-departure_time']

    def __str__(self):
        return f"Поездка #{self.id} - {self.trip_date}"


class Stop(IsDeletedModel):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='stops',
        verbose_name="Поездка",
        help_text="Поездка, к которой относится остановка"
    )
    location = models.CharField(
        max_length=255,
        verbose_name="Местоположение",
        help_text="Адрес или название остановки"
    )
    stop_order = models.IntegerField(
        verbose_name="Порядковый номер",
        help_text="Порядок остановки в маршруте"
    )

    class Meta:
        verbose_name = "Остановка"
        verbose_name_plural = "Остановки"
        ordering = ['stop_order']

    def __str__(self):
        return f"Остановка {self.stop_order}: {self.location}"
