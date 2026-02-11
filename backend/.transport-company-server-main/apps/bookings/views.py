from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.bookings.models import Booking
from apps.bookings.serializer import BookingSerializer, BookingPublicSerializer


class BookingPublicCreateView(generics.CreateAPIView):
    """Публичный эндпоинт для формы заявки на сайте (без авторизации)"""
    
    serializer_class = BookingPublicSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {'message': 'Заявка принята! Мы свяжемся с вами в ближайшее время.'},
            status=status.HTTP_201_CREATED
        )


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с бронированиями - только для администраторов"""
    
    queryset = Booking.objects.select_related('customer').all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Фильтрация по статусу"""
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
