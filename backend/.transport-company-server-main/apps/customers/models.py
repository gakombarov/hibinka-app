from django.db import models
from apps.common.models import IsDeletedModel

CUSTOMER_TYPE_CHOICES = (
    ('INDIVIDUAL', 'Физическое лицо'),
    ('ORGANIZATION', 'Организация'),
)


class Customer(IsDeletedModel):
    contact_person_name = models.CharField(
        max_length=255,
        verbose_name="Контактное лицо",
        help_text="ФИО контактного лица"
    )
    organization_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Название организации",
        help_text="Название компании (если клиент - организация)"
    )
    phone = models.CharField(
        max_length=25,
        verbose_name="Телефон",
        help_text="Контактный номер телефона",
        unique=True
    )
    email = models.EmailField(
        blank=True,
        verbose_name="Email",
        help_text="Адрес электронной почты"
    )
    customer_type = models.CharField(
        max_length=50,
        choices=CUSTOMER_TYPE_CHOICES,
        verbose_name="Тип клиента",
        help_text="Физическое лицо или организация"
    )

    class Meta:
        verbose_name = "Клиент"
        verbose_name_plural = "Клиенты"

    def __str__(self):
        if self.organization_name:
            return f"{self.organization_name} ({self.contact_person_name})"
        return self.contact_person_name