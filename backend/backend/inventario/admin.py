from django.contrib import admin
from .models import Sede, Servicios, Dispositivo, Posicion, UserRol, Movimiento, Historial, RegistroActividad

# Registro de modelos
@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'ciudad', 'direccion')
    search_fields = ('nombre', 'ciudad')

@admin.register(Servicios)
class ServiciosAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_analitico')
    filter_horizontal = ('sedes',)  # Para selección múltiple de sedes

@admin.register(Dispositivo)
class DispositivoAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'marca', 'modelo', 'serial', 'sede', 'usuario_asignado')
    list_filter = ('tipo', 'marca', 'sede')
    search_fields = ('serial', 'modelo', 'marca')

@admin.register(Posicion)
class PosicionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fila', 'columna', 'estado', 'sede')
    list_filter = ('estado', 'sede')
    search_fields = ('nombre', 'sede')

@admin.register(UserRol)
class UserRolAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'rol', 'nombre', 'celular')
    list_filter = ('rol',)
    search_fields = ('username', 'email', 'nombre')

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ('dispositivo', 'encargado', 'fecha_movimiento', 'ubicacion_origen', 'ubicacion_destino')
    list_filter = ('fecha_movimiento', 'encargado')
    search_fields = ('dispositivo__serial', 'encargado__username')

@admin.register(Historial)
class HistorialAdmin(admin.ModelAdmin):
    list_display = ('dispositivo', 'usuario', 'fecha_modificacion', 'tipo_cambio')
    list_filter = ('tipo_cambio', 'fecha_modificacion')
    search_fields = ('dispositivo__serial', 'usuario__username')

@admin.register(RegistroActividad)
class RegistroActividadAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'accion', 'fecha', 'ip_origen')
    list_filter = ('fecha', 'usuario')
    search_fields = ('usuario__username', 'accion')