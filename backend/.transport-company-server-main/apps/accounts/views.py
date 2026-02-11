from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serializers import CreateUserSerializer, UserShortSerializer, MyTokenObtainPairSerializer
from apps.accounts.models import User


class CreateDriverView(generics.CreateAPIView):
    """Создание водителя - ТОЛЬКО для админов"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated] 
    serializer_class = CreateUserSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.account_type != 'ADMIN':
            return Response(
                {'error': 'Только администраторы могут создавать водителей'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['account_type'] = 'DRIVER'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserShortSerializer(user).data,
            'message': 'Водитель успешно создан'
        }, status=status.HTTP_201_CREATED)


class MyTokenObtainPairView(TokenObtainPairView):
    """Вход для админов и водителей"""
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    """Получить данные текущего пользователя"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserShortSerializer
    
    def get_object(self):
        return self.request.user
