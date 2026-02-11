from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .forms import UserCreationForm, UserChangeForm


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('email', 'full_name', 'account_type_badge', 'is_staff', 'is_superuser', 'is_active', 'created_at')
    list_filter = ('account_type', 'is_staff', 'is_superuser', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личная информация', {'fields': ('first_name', 'last_name', 'avatar')}),
        ('Права доступа', {
            'fields': ('account_type', 'is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Важные даты', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at', 'last_login')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 
                'password1', 'password2', 
                'account_type', 
                'is_staff', 'is_active', 'is_superuser'
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')

    def account_type_badge(self, obj):
        colors = {
            'ADMIN': 'red',
            'DRIVER': 'blue',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.account_type, 'gray'),
            obj.get_account_type_display()
        )
    
    account_type_badge.short_description = 'Тип аккаунта'
