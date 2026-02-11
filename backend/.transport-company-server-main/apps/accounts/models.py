from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from apps.accounts.managers import CustomUserManager
from apps.common.models import IsDeletedModel

ACCOUNT_TYPE_CHOICES = (
    ("ADMIN", "Администратор"),
    ("DRIVER", "Водитель"),
)


class User(IsDeletedModel, AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(
        max_length=25,
        null=True,
        verbose_name="Имя",
        help_text="Имя пользователя"
    )
    last_name = models.CharField(
        max_length=25,
        null=True,
        verbose_name="Фамилия",
        help_text="Фамилия пользователя"
    )
    email = models.EmailField(
        unique=True,
        verbose_name="Email",
        help_text="Email адрес для входа в систему"
    )
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        default='avatars/default.jpg',
        verbose_name="Аватар",
        help_text="Фотография профиля пользователя"
    )

    is_staff = models.BooleanField(
        default=False,
        verbose_name="Статус персонала",
        help_text="Определяет доступ к административной панели"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активен",
        help_text="Активен ли аккаунт пользователя"
    )
    account_type = models.CharField(
        max_length=10,
        choices=ACCOUNT_TYPE_CHOICES,
        default="DRIVER",
        verbose_name="Тип аккаунта",
        help_text="Роль пользователя в системе"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.full_name