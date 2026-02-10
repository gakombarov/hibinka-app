# apps/drivers/serializer.py
from rest_framework import serializers
from apps.accounts.models import User
from apps.accounts.serializers import UserShortSerializer
from apps.drivers.models import DriverProfile, DriverPayment


class DriverPaymentSerializer(serializers.ModelSerializer):
    driver = serializers.PrimaryKeyRelatedField(queryset=DriverProfile.objects.all())
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)

    class Meta:
        model = DriverPayment
        fields = [
            'id',
            'driver',      
            'driver_name',    
            'payment_date',
            'period_start',
            'period_end',
            'days_worked',
            'base_amount',
            'bonus_amount',
            'bonus_reason',
            'total_amount',
            'notes',
        ]
        read_only_fields = ['id', 'days_worked', 'base_amount', 'total_amount', 'driver_name']

class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    payments = DriverPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = DriverProfile
        fields = [
            'id',
            'user',
            'phone',
            'license_number',
            'license_category',
            'hire_date',
            'status',
            'daily_rate',
            'payments',
        ]
        read_only_fields = ['id', 'user', 'payments']

class DriverProfileCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = DriverProfile
        fields = [
            'email',
            'phone',
            'license_number',
            'license_category',
            'hire_date',
            'status',
            'daily_rate',
        ]

    def create(self, validated_data):
        email = validated_data.pop('email')
        try:
            user = User.objects.get(email=email, account_type='DRIVER')
        except User.DoesNotExist:
            raise serializers.ValidationError('Профиль водителя не существует')
        
        return DriverProfile.objects.create(user=user, **validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('email', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance