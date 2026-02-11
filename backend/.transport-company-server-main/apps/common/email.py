from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_simple_email(subject, message, recipient_list):
    """
    Отправка простого текстового email.
    
    Args:
        subject: тема письма
        message: текст письма
        recipient_list: список email получателей
    """
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )


def send_html_email(subject, template_name, context, recipient_list):
    """
    Отправка HTML email с использованием шаблона.
    
    Args:
        subject: тема письма
        template_name: путь к HTML шаблону
        context: данные для шаблона
        recipient_list: список email получателей
    """
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipient_list
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)


def send_trip_notification(trip, notification_type='created'):
    """
    Отправка уведомления о поездке.
    
    Args:
        trip: объект Trip
        notification_type: 'created', 'updated', 'cancelled', 'completed'
    """
    subjects = {
        'created': f'Новая поездка #{trip.id}',
        'updated': f'Изменение поездки #{trip.id}',
        'cancelled': f'Отмена поездки #{trip.id}',
        'completed': f'Поездка #{trip.id} завершена',
    }
    
    context = {
        'trip': trip,
        'notification_type': notification_type,
        'driver_name': trip.driver.user.get_full_name() if trip.driver else 'Не назначен',
        'customer_name': trip.customer.get_full_name(),
        'departure_location': trip.departure_location,
        'arrival_location': trip.arrival_location,
        'trip_date': trip.trip_date.strftime('%d.%m.%Y'),
        'departure_time': trip.departure_time.strftime('%H:%M') if trip.departure_time else '-',
    }

    if trip.driver and trip.driver.user.email:
        send_html_email(
            subject=subjects[notification_type],
            template_name='emails/trip_notification.html',
            context=context,
            recipient_list=[trip.driver.user.email]
        )
    
    if hasattr(trip.customer, 'email') and trip.customer.email:
        send_html_email(
            subject=subjects[notification_type],
            template_name='emails/trip_notification_customer.html',
            context=context,
            recipient_list=[trip.customer.email]
        )
