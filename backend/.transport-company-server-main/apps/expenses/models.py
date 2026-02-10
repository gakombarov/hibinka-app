from django.db import models
from apps.common.models import IsDeletedModel


class Expense(IsDeletedModel):
    expense_date = models.DateField(
        verbose_name="Дата расхода",
        help_text="Дата совершения расхода"
    )
    category = models.CharField(
        max_length=50,
        verbose_name="Категория",
        help_text="Тип расхода"
    )
    responsible_person = models.CharField(
        max_length=255,
        verbose_name="Ответственное лицо",
        help_text="Кто произвел или согласовал расход"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Сумма",
        help_text="Сумма расхода (в рублях)"
    )
    description = models.TextField(
        verbose_name="Описание",
        help_text="Подробное описание расхода",
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = "Расход"
        verbose_name_plural = "Расходы"
        ordering = ['-expense_date']

    def __str__(self):
        return f"Расход {self.category} - {self.expense_date} ({self.amount}₽)"