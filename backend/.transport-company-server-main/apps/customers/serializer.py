from rest_framework import serializers
from apps.customers.models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    contact_person_name = serializers.CharField(source='customer.contact_person_name', read_only=True)

    class Meta:
      model = Customer
      fields = [
         'id',
         'contact_person_name',
         'organization_name',
         'phone',
         'email',
         'customer_type',
         'is_deleted',
         'created_at',
         'updated_at'
      ]
      read_only_field = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Валидация необходимости названия организации для юр. лиц"""
        customer_type = data.get('customer_type')
        organization_name = data.get('organization_name')

        if customer_type == 'ORGANIZATION' and not organization_name:
            raise serializers.ValidationError('Название организации обязательно для юридических лиц')
        
        return data
    
    def validate_phone(self, value):
        """Валидация номера телефона (должен быть русским)"""
        import re
        if not re.match(r'^\+?[78][\d\s\-\(\)]{9,}$', value):
            raise serializers.ValidationError(
                'Некорректный формат телефона'
            )
        return value