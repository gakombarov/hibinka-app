from django.contrib import admin
from django.utils.html import format_html
from .models import DriverProfile, DriverPayment


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('driver_name', 'phone', 'license_number', 'status_badge', 'daily_rate', 'hire_date', 'created_at')
    list_filter = ('status', 'hire_date', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'license_number', 'phone')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Пользователь', {
            'fields': ('user',)
        }),
        ('Контактная информация', {
            'fields': ('phone',)
        }),
        ('Водительская информация', {
            'fields': ('license_number', 'license_category', 'status', 'hire_date', 'daily_rate')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def driver_name(self, obj):
        return obj.user.full_name

    driver_name.short_description = 'ФИО водителя'
    driver_name.admin_order_field = 'user__first_name'

    def status_badge(self, obj):
        colors = {
            'ACTIVE': 'green',
            'INACTIVE': 'gray',
            'ON_VACATION': 'orange',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )

    status_badge.short_description = 'Статус'


@admin.register(DriverPayment)
class DriverPaymentAdmin(admin.ModelAdmin):
    list_display = ('driver', 'payment_date', 'period_display', 'days_worked',
                    'base_amount_display', 'bonus_amount_display', 'total_amount_display', 'created_at')
    list_filter = ('payment_date', 'created_at')
    search_fields = ('driver__user__first_name', 'driver__user__last_name', 'notes')
    date_hierarchy = 'payment_date'
    readonly_fields = ('days_worked', 'base_amount', 'total_amount', 'created_at', 'updated_at')

    fieldsets = (
        ('Основная информация', {
            'fields': ('driver', 'payment_date')
        }),
        ('Период работы', {
            'fields': ('period_start', 'period_end', 'days_worked')
        }),
        ('Расчет суммы', {
            'fields': ('base_amount', 'bonus_amount', 'bonus_reason', 'total_amount')
        }),
        ('Дополнительно', {
            'fields': ('notes',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def period_display(self, obj):
        return f"{obj.period_start} - {obj.period_end}"

    period_display.short_description = 'Период'

    def base_amount_display(self, obj):
        return format_html('<strong>{:,.2f} ₽</strong>', obj.base_amount or 0)

    base_amount_display.short_description = 'Базовая сумма'

    def bonus_amount_display(self, obj):
        if obj.bonus_amount > 0:
            return format_html('<span style="color: green;"><strong>+{:,.2f} ₽</strong></span>', obj.bonus_amount)
        return '—'

    bonus_amount_display.short_description = 'Бонус'

    def total_amount_display(self, obj):
        return format_html('<strong style="font-size: 1.1em; color: #0066cc;">{:,.2f} ₽</strong>',
                           obj.total_amount or 0)

    total_amount_display.short_description = 'Итого'
