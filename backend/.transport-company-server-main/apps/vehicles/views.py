from rest_framework import viewsets, filters

from apps.vehicles.models import Vehicle
from .serializer import VehicleSerializer, VehicleCreateSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['brand', 'model', 'license_plate']
    ordering_fields = ['created_at', 'brand', 'model']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return VehicleCreateSerializer
        return VehicleSerializer
