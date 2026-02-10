from rest_framework import serializers
from apps.bookings.models import Booking
from apps.customers.models import Customer
from apps.customers.serializer import CustomerSerializer
from django.core.mail import send_mail
import re

class BookingPublicSerializer(serializers.ModelSerializer):
    """Для формы заявки на сайте (анонимные пользователи)"""
    customer_name = serializers.CharField(
        write_only=True,
        min_length=2,
        max_length=255,
        required=True,
        error_messages={
            'min_length': 'Минимум 2 символа',
            'required': 'Укажите ваше ФИО'
        }
    )
    customer_phone = serializers.CharField(
        write_only=True,
        max_length=25,
        required=True,
        error_messages={
            'required': 'Укажите ваш номер телефона'
        }
    )
    customer_email = serializers.EmailField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Booking
        fields = [
            'customer_name', 'customer_phone', 'customer_email',
            'desired_trip_date', 'desired_departure_time', 'desired_trip_location',
            'arrival_location', 'passenger_count',
            'luggage_description', 'notes'
        ]

    def validate_customer_phone(self, value):
        """Валидация и нормализация российского номера телефона"""
        phone = re.sub(r'\D', '', value)
        
        if not re.match(r'^[78]\d{10}$', phone):
            raise serializers.ValidationError(
                'Неверный формат телефона. Используйте формат: +7 (xxx) xxx-xx-xx'
            )
        
        if phone.startswith('8'):
            phone = '7' + phone[1:]
        
        return phone
    
    def validate_passenger_count(self, value):
        """Проверка количества пассажиров"""
        if value <= 0:
            raise serializers.ValidationError(
                'Количество пассажиров должно быть больше нуля'
            )
        if value > 50:
            raise serializers.ValidationError(
                'Количество пассажиров слишком большое свяжитесь с нами напрямую'
            )
        return value
    
    def validate_desired_trip_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError(
                'Дата поездки не может быть в прошлом'
            )
        return value
    
    def create(self, validated_data):
        customer_name = validated_data.pop('customer_name')
        customer_phone = validated_data.pop('customer_phone')
        customer_email = validated_data.pop('customer_email')

        customer, created = Customer.objects.get_or_create(
            phone=customer_phone,
            defaults={
                'name': customer_name,
                'email': customer_email
            }
        )

        if not created:
            customer.contact_person_name = customer_name
            if customer_email:
                customer.email = customer_email
            customer.save()

        booking = Booking.objects.create(
            customer=customer,
            source='WEBSITE',
            status='NEW',
            **validated_data
        )

        self.send_notification_email(booking)

        return booking
    
    def send_notification_email(self, booking):
        send_mail(
            subject=f'Новая заявка #{booking.id}',
            message=f'Клиент: {booking.customer.contact_person_name}\n'
                    f'Телефон: {booking.customer.phone}\n'
                    f'Email: {booking.customer.email or "не указан"}\n'
                    f'Дата: {booking.desired_trip_date}\n'
                    f'Время: {booking.desired_departure_time}\n'
                    f'Куда: {booking.arrival_location}\n'
                    f'Пассажиров: {booking.passenger_count}\n'
                    f'Багаж: {booking.luggage_description or "не указан"}\n'
                    f'Примечания: {booking.notes or "нет"}',
            from_email='noreply@transport.ru',
            recipient_list=['admin@transport.ru'],
            fail_silently=True,
        )

class BookingSerializer(serializers.ModelSerializer):
    """Для администраторов через API - полная информация"""
    
    customer = CustomerSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'source', 'desired_trip_date', 'desired_trip_location',
            'desired_departure_time', 'arrival_location',
            'passenger_count', 'luggage_description',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']