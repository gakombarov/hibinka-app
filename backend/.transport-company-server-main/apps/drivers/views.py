from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from apps.drivers.models import DriverProfile
from .serializer import (
    DriverProfileSerializer,
    DriverProfileCreateSerializer,
)


class DriverProfileViewSet(viewsets.ModelViewSet):
    queryset = DriverProfile.objects.select_related('user').prefetch_related('payments')
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'phone', 'license_number']
    ordering_fields = ['created_at', 'user__first_name', 'user__last_name']
    ordering = ['-created_at']


    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return DriverProfileCreateSerializer
        return DriverProfileSerializer
