"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from inventario import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', views.get_users_view, name='get-users'),
    path('users/<int:user_id>/', views.user_detail_view, name='user-detail'),
    path('users/activate/<int:user_id>/', views.activate_user_view, name='activate-user'),
    path('users/deactivate/<int:user_id>/', views.deactivate_user_view, name='deactivate-user'),
    path('users/register/', views.register_user_view, name='register-user'),
    path('users/reset-password-request/', views.reset_password_request, name='reset-password-request'),
    path('users/reset-password/', views.reset_password, name='reset-password'),
    path('users/edit/<int:user_id>/', views.edit_user_view, name='edit-user'),

    # URLs para sedes
    path('sedes/', views.sede_view, name='sede-list'),
    path('sedes/<int:sede_id>/', views.sede_detail_view, name='sede-detail'),

    # URLs para dispositivos
    path('dispositivos/', views.dispositivo_view, name='dispositivo-list'),
    path('dispositivos/<int:dispositivo_id>/', views.dispositivo_detail_view, name='dispositivo-detail'),

    # URLs para servicios
    path('servicios/', views.servicios_view, name='servicio-list'),
    path('servicios/<int:servicio_id>/', views.servicio_detail_view, name='servicio-detail'),

    # URLs para posiciones
    path('posiciones/', views.PosicionListCreateView.as_view(), name='posicion-list-create'),
    path('posiciones/<str:id>/', views.PosicionRetrieveUpdateDestroyView.as_view(), name='posicion-retrieve-update-destroy'),
    path('posiciones/colores-pisos/', views.get_colores_pisos, name='colores-pisos'),

    # URLs para autenticación
    path('login/', views.login_view, name='login'),
]
