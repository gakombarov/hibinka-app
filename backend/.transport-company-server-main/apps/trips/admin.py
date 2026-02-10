from django.contrib import admin
from django.utils.html import format_html
from .models import Trip, Stop


class StopInline(admin.TabularInline):
    model = Stop
    extra = 1
    fields = ('stop_order', 'location')
    ordering = ('stop_order',)


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_id', 'trip_date', 'departure_time', 'driver', 'vehicle',
                    'route_display', 'status_badge', 'payment_status_badge', 'created_at')
    list_filter = ('status', 'payment_status', 'trip_date', 'created_at')
    search_fields = ('departure_location', 'arrival_location', 'driver__user__first_name',
                     'driver__user__last_name', 'customer__contact_person_name')
    date_hierarchy = 'trip_date'
    inlines = [StopInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Основная информация', {
            'fields': ('booking', 'customer', 'trip_date', 'departure_time')
        }),
        ('Маршрут', {
            'fields': ('departure_location', 'arrival_location', 'passenger_count')
        }),
        ('Назначение', {
            'fields': ('vehicle', 'driver')
        }),
        ('Оплата', {
            'fields': ('planned_amount', 'actual_amount', 'payment_status')
        }),
        ('Статус и примечания', {
            'fields': ('status', 'notes')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def trip_id(self, obj):
        return f"#{str(obj.id)[:8]}"

    trip_id.short_description = 'ID'

    def route_display(self, obj):
        return format_html('{}  →  {}', obj.departure_location[:20], obj.arrival_location[:20])

    route_display.short_description = 'Маршрут'

    def status_badge(self, obj):
        colors = {
            'PLANNED': 'blue',
            'IN_PROGRESS': 'orange',
            'COMPLETED': 'green',
            'CANCELLED': 'red',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )

    status_badge.short_description = 'Статус'

    def payment_status_badge(self, obj):
        colors = {
            'PENDING': 'red',
            'PAID': 'green',
            'PARTIAL': 'orange',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.payment_status, 'gray'),
            obj.get_payment_status_display()
        )

    payment_status_badge.short_description = 'Оплата'


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('trip', 'stop_order', 'location', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('location', 'trip__departure_location')
