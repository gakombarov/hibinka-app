from datetime import datetime
from rest_framework import serializers
from apps.vehicles.models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
      model = Vehicle
      fields = [
          'id',
          'brand',
          'model',
          'year',
          'license_plate',
          'capacity',
          'category',
          'is_active',
          'created_at',
          'updated_at',
      ]
      read_only_fields = ['id', 'created_at', 'updated_at']

class VehicleCreateSerializer(serializers.ModelSerializer):
    class Meta:
      model = Vehicle
      fields = [
          'brand',
          'model',
          'year',
          'license_plate',
          'capacity',
          'category',
      ]

    def validate_license_plate(self, value):
        """Валидация российского госномера"""
        pattern = r'^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$'
        
        normalized = value.upper().replace(' ', '')
        
        if not re.match(pattern, normalized):
            raise serializers.ValidationError(
                "Неверный формат госномера. Ожидается формат: А123ВС77"
            )
        
        queryset = Vehicle.objects.filter(license_plate=normalized)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Транспорт с таким госномером уже зарегистрирован"
            )
        
        return normalized

    def validate_year(self, value):
        """Валидация года выпуска"""
        current_year = datetime.now().year
        
        if value > current_year:
            raise serializers.ValidationError(
                "Год выпуска не может быть в будущем"
            )
        
        if value < 1950:
            raise serializers.ValidationError(
                "Год выпуска слишком старый для учёта"
            )
        
        return value