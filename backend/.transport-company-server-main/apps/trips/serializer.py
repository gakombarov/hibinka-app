from rest_framework import serializers
from apps.trips.models import Trip, Stop


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ['id', 'location', 'stop_order']
        read_only_fields = ['id']


class TripSerializer(serializers.ModelSerializer):
    """
    Универсальный сериализатор для Trip
    Для чтения - возвращает развернутые данные
    Для записи - принимает ID связанных объектов
    """
    # Поля только для чтения (для отображения)
    customer_name = serializers.SerializerMethodField(read_only=True)
    vehicle_info = serializers.SerializerMethodField(read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)
    cost = serializers.SerializerMethodField(read_only=True)
    
    # Остановки - для чтения и записи
    stops = StopSerializer(many=True, required=False)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'booking', 'customer', 'customer_name',
            'vehicle', 'vehicle_info', 'driver', 'driver_name',
            'trip_date', 'departure_time',
            'departure_location', 'arrival_location',
            'passenger_count', 'planned_amount', 'actual_amount',
            'payment_status', 'status', 'notes', 'stops', 'cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 
                           'customer_name', 'vehicle_info', 'driver_name', 'cost']
    
    def get_customer_name(self, obj):
        """Имя клиента или название организации"""
        if obj.customer.customer_type == 'ORGANIZATION':
            return obj.customer.organization_name
        return obj.customer.contact_person_name
    
    def get_vehicle_info(self, obj):
        """Информация об автомобиле"""
        if obj.vehicle:
            return f"{obj.vehicle.brand} {obj.vehicle.model} ({obj.vehicle.license_plate})"
        return None
    
    def get_cost(self, obj):
        """Фактическая или плановая стоимость"""
        return float(obj.actual_amount if obj.actual_amount else obj.planned_amount)
    
    def validate(self, data):
        """Валидация данных"""
        vehicle = data.get('vehicle')
        passenger_count = data.get('passenger_count')
        
        if vehicle and passenger_count and passenger_count > vehicle.capacity:
            raise serializers.ValidationError(
                f"Количество пассажиров превышает вместимость транспорта"
            )
        
        return data
    
    def create(self, validated_data):
        """Создание поездки с остановками"""
        stops_data = validated_data.pop('stops', [])
        trip = Trip.objects.create(**validated_data)
        
        for stop_data in stops_data:
            Stop.objects.create(trip=trip, **stop_data)
        
        return trip
    
    def update(self, instance, validated_data):
        """Обновление поездки с остановками"""
        stops_data = validated_data.pop('stops', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if stops_data is not None:
            instance.stops.all().delete()
            for stop_data in stops_data:
                Stop.objects.create(trip=instance, **stop_data)
        
        return instance
    
class TripDetailSerializer(serializers.ModelSerializer):
    """
    Только для детального просмотра - с полными вложенными объектами
    """
    from apps.customers.serializer import CustomerSerializer
    from apps.vehicles.serializer import VehicleSerializer
    from apps.drivers.serializer import DriverProfileSerializer
    
    customer = CustomerSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    driver = DriverProfileSerializer(read_only=True)
    stops = StopSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = '__all__'