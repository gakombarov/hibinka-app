import uuid
from django.db import models
from django.utils import timezone
from apps.common.managers import IsDeletedManager, GetOrNoneManager


class BaseModel(models.Model):
    """Базовая модель с UUID и временными метками"""

    id = models.UUIDField(
        default=uuid.uuid4,
        primary_key=True,
        editable=False,
        verbose_name="ID",
        help_text="Уникальный идентификатор"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания",
        help_text="Автоматически устанавливается при создании"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Дата обновления",
        help_text="Автоматически обновляется при каждом сохранении"
    )

    objects = GetOrNoneManager()

    class Meta:
        abstract = True


class IsDeletedModel(BaseModel):
    """Базовая модель с мягким удалением"""

    is_deleted = models.BooleanField(
        default=False,
        verbose_name="Удалено",
        help_text="Отметка о мягком удалении записи"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Дата удаления",
        help_text="Время когда запись была помечена как удаленная"
    )

    objects = IsDeletedManager()

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        """Мягкое удаление: устанавливает is_deleted=True"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])

    def hard_delete(self, *args, **kwargs):
        """Настоящее удаление из базы данных"""
        super().delete(*args, **kwargs)
