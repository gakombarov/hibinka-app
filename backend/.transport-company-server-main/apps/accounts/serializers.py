from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import User


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value: str) -> str:
        """Валидация пароля через стандартные валидаторы Django"""
        validate_password(value)
        return value
    
    def create(self, validated_data):
        """Создает пользователя и хэширует пароль"""
        user = User(email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class UserShortSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'avatar', 'account_type', 'is_active']
        read_only_fields = fields
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if user.is_superuser:
            token['group'] = 'superadmin'
            token['role'] = 'SUPERUSER'
        elif user.is_staff:
            token['group'] = 'admin'
            token['role'] = user.account_type
        else:
            token['group'] = 'user'
            token['role'] = user.account_type
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserShortSerializer(self.user).data
        
        return data