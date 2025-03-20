from django.contrib.auth import logout
from django.utils.deprecation import MiddlewareMixin

class AutoLogoutMiddleware(MiddlewareMixin):
    """
    Middleware para cerrar sesión si el usuario está desactivado.
    """
    def process_request(self, request):
        if request.user.is_authenticated and not request.user.is_active:
            logout(request)
