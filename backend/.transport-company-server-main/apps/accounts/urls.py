from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from apps.accounts.views import CreateDriverView, MyTokenObtainPairView, CurrentUserView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('me/', CurrentUserView.as_view(), name='current_user'),

    path('drivers/create/', CreateDriverView.as_view(), name='create_driver'),
]