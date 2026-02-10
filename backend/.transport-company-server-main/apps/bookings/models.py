from django.db import models
from apps.customers.models import Customer
from apps.common.models import IsDeletedModel

BOOKING_SOURCE_CHOICES = (
    ('PHONE', 'Телефон'),
    ('EMAIL', 'Email'),
    ('WEBSITE', 'Сайт'),
    ('MESSENGER', 'Мессенджер'),
)

BOOKING_STATUS_CHOICES = (
    ('NEW', 'Новая'),
    ('CONFIRMED', 'Подтверждена'),
    ('IN_PROGRESS', 'В работе'),
    ('COMPLETED', 'Завершена'),
    ('CANCELLED', 'Отменена'),
)


class Booking(IsDeletedModel):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name="Клиент",
        help_text="Клиент, сделавший бронирование"
    )
    source = models.CharField(
        max_length=25,
        choices=BOOKING_SOURCE_CHOICES,
        verbose_name="Источник заявки",
        help_text="Откуда поступила заявка"
    )
    desired_trip_date = models.DateField(
        verbose_name="Желаемая дата поездки",
        help_text="Дата когда клиент хочет совершить поездку"
    )
    desired_departure_time = models.TimeField(
        verbose_name="Желаемое время отправления",
        help_text="Время отправления по желанию клиента"
    )
    desired_trip_location = models.CharField(
        max_length=255,
        verbose_name="Желаемое место отправления",
        help_text="Адрес или название пункта отправления",
        default=''
    )
    arrival_location = models.CharField(
        max_length=255,
        verbose_name="Место прибытия",
        help_text="Адрес или название пункта назначения"
    )
    passenger_count = models.IntegerField(
        verbose_name="Количество пассажиров",
        help_text="Сколько человек планируют поездку"
    )
    luggage_description = models.TextField(
        blank=True,
        verbose_name="Описание багажа",
        help_text="Информация о количестве и типе багажа"
    )
    status = models.CharField(
        max_length=50,
        choices=BOOKING_STATUS_CHOICES,
        default='NEW',
        verbose_name="Статус",
        help_text="Текущий статус бронирования"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Примечания",
        help_text="Дополнительные заметки и пожелания"
    )

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"
        ordering = ['-created_at']

    def __str__(self):
        return f"Бронирование #{self.id} - {self.customer}"
