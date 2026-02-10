from django.db import models
from django.core.exceptions import ValidationError
from apps.accounts.models import User
from apps.common.models import IsDeletedModel

STATUS_CHOICES = (
    ('ACTIVE', 'Активен'),
    ('INACTIVE', 'Неактивен'),
    ('ON_VACATION', 'В отпуске'),
)


class DriverProfile(IsDeletedModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='driver_profile',
        verbose_name="Пользователь",
        help_text="Связанный аккаунт пользователя"
    )
    phone = models.CharField(
        max_length=25,
        verbose_name="Телефон",
        help_text="Контактный номер телефона водителя"
    )
    license_number = models.CharField(
        max_length=25,
        unique=True,
        verbose_name="Номер водительского удостоверения",
        help_text="Уникальный номер ВУ"
    )
    license_category = models.CharField(
        max_length=25,
        verbose_name="Категория ВУ",
        help_text="Категория водительского удостоверения (например, D, D1)"
    )
    hire_date = models.DateField(
        verbose_name="Дата найма",
        help_text="Дата приема на работу"
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name="Статус",
        help_text="Текущий статус водителя"
    )
    daily_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Дневная ставка",
        help_text="Оплата за один рабочий день (в рублях)"
    )

    class Meta:
        verbose_name = "Профиль водителя"
        verbose_name_plural = "Профили водителей"

    def __str__(self):
        return f"{self.user.full_name} - {self.license_number}"


class DriverPayment(IsDeletedModel):
    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Водитель",
        help_text="Водитель, которому производится выплата"
    )
    payment_date = models.DateField(
        verbose_name="Дата выплаты",
        help_text="Дата фактической выплаты"
    )
    period_start = models.DateField(
        verbose_name="Начало периода",
        help_text="Дата начала расчетного периода"
    )
    period_end = models.DateField(
        verbose_name="Конец периода",
        help_text="Дата окончания расчетного периода"
    )

    days_worked = models.IntegerField(
        editable=False,
        null=True,
        blank=True,
        verbose_name="Отработано дней",
        help_text="Автоматически вычисляется на основе периода"
    )
    base_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False,
        null=True,
        blank=True,
        verbose_name="Базовая сумма",
        help_text="Автоматически вычисляется: дни × ставка"
    )

    bonus_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Сумма бонуса",
        help_text="Дополнительная премия (в рублях)"
    )
    bonus_reason = models.TextField(
        blank=True,
        verbose_name="Причина бонуса",
        help_text="Описание за что выплачен бонус"
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False,
        null=True,
        blank=True,
        verbose_name="Итоговая сумма",
        help_text="Автоматически вычисляется: базовая сумма + бонус"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Примечания",
        help_text="Дополнительные заметки о выплате"
    )

    class Meta:
        verbose_name = "Выплата водителю"
        verbose_name_plural = "Выплаты водителям"
        ordering = ['-payment_date']

    def clean(self):
        if self.period_start and self.period_end:
            if self.period_end < self.period_start:
                raise ValidationError('Дата окончания периода не может быть раньше даты начала')

    def calculate_days_worked(self):
        if self.period_start and self.period_end:
            delta = self.period_end - self.period_start
            return delta.days + 1
        return 0

    def calculate_base_amount(self):
        days = self.days_worked or self.calculate_days_worked()
        return days * self.driver.daily_rate

    def calculate_total_amount(self):
        base = self.base_amount or self.calculate_base_amount()
        return base + (self.bonus_amount or 0)

    def save(self, *args, **kwargs):
        if not self.days_worked:
            self.days_worked = self.calculate_days_worked()

        if not self.base_amount:
            self.base_amount = self.calculate_base_amount()

        self.total_amount = self.calculate_total_amount()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Выплата {self.driver.user.full_name} - {self.payment_date}"
