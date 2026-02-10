from django.db import models


class GetOrNoneManager(models.Manager):
    """Менеджер с методом get_or_none"""

    def get_or_none(self, **kwargs):
        try:
            return self.get(**kwargs)
        except self.model.DoesNotExist:
            return None


class IsDeletedManager(GetOrNoneManager):
    """Менеджер для фильтрации удаленных объектов"""

    def get_queryset(self):
        # По умолчанию возвращает только не удаленные
        return super().get_queryset().filter(is_deleted=False)

    def with_deleted(self):
        # Все объекты включая удаленные
        return super().get_queryset()

    def only_deleted(self):
        # Только удаленные объекты
        return super().get_queryset().filter(is_deleted=True)