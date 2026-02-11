from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.bookings.views import BookingViewSet, BookingPublicCreateView

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('public/booking/', BookingPublicCreateView.as_view(), name='public-booking-create'),
    path('', include(router.urls)),
]
