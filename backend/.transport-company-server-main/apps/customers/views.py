from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import BaseFilterBackend

from apps.customers.models import Customer
from apps.customers.serializer import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['contact_person_name', 'organization_name', 'phone', 'email']
    ordering_fields = ['created_at', 'contact_person_name']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def organizations(self, request):
        """Путь для получения только организаций"""
        organizations = self.queryset.filter(customer_type='ORGANIZATION')
        serializer = self.get_serializer(organizations, many=True)
        return Response(serializer.data)