from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User

class UserCreationForm(forms.ModelForm):
    """Форма для создания нового пользователя"""
    password1 = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput,
        help_text='Минимум 8 символов'
    )
    password2 = forms.CharField(
        label='Подтверждение пароля',
        widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'account_type', 'is_staff', 'is_active')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Пароли не совпадают")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """Форма для изменения пользователя"""
    password = ReadOnlyPasswordHashField(
        label="Пароль",
        help_text=(
            "Пароли хранятся в зашифрованном виде. "
            '<a href="../password/">Изменить пароль</a>.'
        ),
    )

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'avatar',
                  'is_active', 'is_staff', 'account_type')
