from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from apps.trips.models import Trip
from apps.trips.serializer import TripSerializer, TripDetailSerializer
from apps.common.email import send_trip_notification  
import logging 

logger = logging.getLogger(__name__)  


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.select_related(
        'customer', 'vehicle', 'driver', 'driver__user'
    ).prefetch_related('stops').filter(is_deleted=False)
    
    def get_serializer_class(self):
        """Детальный сериализатор только для retrieve"""
        if self.action == 'retrieve':
            return TripDetailSerializer
        return TripSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.account_type == 'DRIVER':
            return queryset.filter(driver__user=user)
        
        return queryset
    
    def perform_create(self, serializer):
        """Создание поездки + email"""
        trip = serializer.save()
        try:
            send_trip_notification(trip, notification_type='created')
            logger.info(f'Email sent for trip #{trip.id} creation')
        except Exception as e:
            logger.error(f'Email error for trip #{trip.id}: {str(e)}')
    
    def perform_update(self, serializer):
        """Обновление поездки + email"""
        trip = serializer.save()
        try:
            send_trip_notification(trip, notification_type='updated')
            logger.info(f'Email sent for trip #{trip.id} update')
        except Exception as e:
            logger.error(f'Email error for trip #{trip.id}: {str(e)}')
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            send_trip_notification(instance, notification_type='cancelled')
            logger.info(f'Cancellation email sent for trip #{instance.id}')
        except Exception as e:
            logger.error(f'Email error for trip #{instance.id}: {str(e)}')
        
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
