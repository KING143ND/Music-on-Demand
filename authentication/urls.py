from django.urls import path
from authentication import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('change-password/', views.CustomPasswordChangeView.as_view(), name='change_password'),
]
