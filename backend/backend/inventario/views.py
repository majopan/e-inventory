from django.contrib.auth.hashers import make_password # type: ignore
from django.core.mail import send_mail # type: ignore
from django.conf import settings # type: ignore # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view,permission_classes # type: ignore
from .models import Sede, Servicios, Dispositivo, Posicion, UserRol, Movimiento, Historial, RegistroActividad # type: ignore
import logging
from rest_framework import viewsets # type: ignore
logger = logging.getLogger(__name__) # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from rest_framework import status, generics # type: ignore
from .serializers import LoginSerializer # type: ignore
from .serializers import UserRolSerializer, DispositivoSerializer, SedeSerializer, ServiciosSerializer, PosicionSerializer # type: ignore 
from django.shortcuts import get_object_or_404 # type: ignore
from rest_framework.permissions import AllowAny # type: ignore
import time

# Create your views here.
#views para users o relacionado con ellos


@api_view(['GET' ])
@permission_classes([IsAuthenticated])  # Solo los usuarios autenticados pueden acceder
def get_users_view(request):
    """
    Obtiene la lista de usuarios.
    """
    # Obtén los usuarios de la base de datos (en tu caso UserRol)
    users = UserRol.objects.all()
    
    # Serializa la lista de usuarios
    serializer = UserRolSerializer(users, many=True)
    
    # Devuelve la lista de usuarios serializada
    return Response(serializer.data)

class UserRolViewSet(viewsets.ModelViewSet):
    queryset = UserRol.objects.all()
    serializer_class = UserRolSerializer

@api_view(['GET', 'POST'])
def login_view(request):
    print("Datos recibidos:", request.data)  # Agrega este log
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Definir las sedes disponibles para el usuario
        if user.rol == 'admin':
            sedes_permitidas = Sede.objects.all()
        elif user.rol == 'coordinador':
            sedes_permitidas = user.sedes.all()
        else:
            return Response({"error": "Rol no autorizado."}, status=403)

        return Response({
            "message": "Inicio de sesión exitoso",
            "username": user.username,
            "rol": user.rol,
            "sedes": list(sedes_permitidas.values("id", "nombre", "ciudad", "direccion"))
        })
    else:
        print("Errores de validación:", serializer.errors)  # Agrega este log
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request, user_id):
    try:
        user = UserRol.objects.get(id=user_id)
    except UserRol.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=404)

    serializer = UserRolSerializer(user)
    return Response(serializer.data, status=200)



@api_view(['PUT'])
@permission_classes([])  # Sin permisos de autenticación
def activate_user_view(request, user_id):
    """
    Activa un usuario cambiando el campo 'is_active' a True.
    """
    try:
        user = UserRol.objects.get(id=user_id)
    except UserRol.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if user.is_active:
        return Response({"message": "El usuario ya está activo."}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = True
    user.save()
    return Response({"message": "Usuario activado exitosamente."}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([])  # Sin permisos de autenticación
def deactivate_user_view(request, user_id):
    """
    Desactiva un usuario cambiando el campo 'is_active' a False.
    """
    try:
        user = UserRol.objects.get(id=user_id)
    except UserRol.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if not user.is_active:
        return Response({"message": "El usuario ya está desactivado."}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = False
    user.save()
    return Response({"message": "Usuario desactivado exitosamente."}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_detail_view(request, user_id):
    """
    Devuelve los detalles de un usuario específico.
    """
    try:
        # Obtener el usuario por ID
        user = UserRol.objects.get(id=user_id)
    except UserRol.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    # Serializar y devolver los datos del usuario
    serializer = UserRolSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET' , 'POST'])
@permission_classes([AllowAny])
def register_user_view(request):
    """
    Registra un nuevo usuario desde el formulario del frontend.
    """
    data = request.data

    # Obtener y validar los campos del formulario
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    confirm_password = data.get('confirm_password', '').strip()
    email = data.get('email', '').strip().lower()
    nombre = data.get('nombre', '').strip()
    celular = data.get('celular', '').strip()
    documento = data.get('documento', '').strip()
    rol = data.get('rol', 'coordinador')
    sedes_ids = data.get('sedes', [])

    # Validaciones básicas
  

    if password != confirm_password:
        return Response({"error": "Las contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)



    try:
        # Crear el usuario
        user = UserRol.objects.create(
            username=username,
            email=email,
            rol=rol,
            nombre=nombre,
            celular=celular,
            documento=documento,
            password=make_password(password),
            is_active=True
        )

        # Asignar sedes al usuario
        sedes = Sede.objects.filter(id__in=sedes_ids)
        user.sedes.set(sedes)
        user.save()

        return Response({"message": "Usuario registrado exitosamente."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error al registrar el usuario: {str(e)}")
        return Response({"error": "Ocurrió un error al registrar el usuario."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#restablcer contraseña de usuario
@api_view(['GET' , 'POST'])
def reset_password_request(request):
    """
    Solicita el restablecimiento de contraseña.
    """
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "El correo es un campo obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserRol.objects.get(email=email)
    except UserRol.DoesNotExist:
        return Response({"error": "El correo no existe."}, status=status.HTTP_404_NOT_FOUND)

    try:
        subject = "Solicitud de restablecimiento de contraseña"
        message = f"""
        Estimado/a {user.username or user.email},
        Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta.
        {settings.FRONTEND_URL}/reset-password?email={email}
        """
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

        return Response({"message": "Revisa tu correo electrónico."}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error al enviar el correo: {str(e)}")
        return Response({"error": "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET' , 'POST'])
def reset_password(request):
    """
    Restablece la contraseña del usuario.
    """
    email = request.data.get('email', '').strip().lower()
    new_password = request.data.get('password', '').strip()

    if not email or not new_password:
        return Response({"error": "Correo y nueva contraseña son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({"error": "La contraseña debe tener al menos 8 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserRol.objects.get(email=email)
        user.password = make_password(new_password)
        user.save()
        return Response({"message": "Contraseña cambiada exitosamente."}, status=status.HTTP_200_OK)
    except UserRol.DoesNotExist:
        return Response({"error": "El correo no está registrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Error al cambiar la contraseña: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
# views de sedes
@api_view(['GET'])
def get_sedes_view(request):
    """
    Devuelve una lista de sedes disponibles.
    """
    try:
        sedes = Sede.objects.all().values('id', 'nombre', 'ciudad', 'direccion')
        return Response({"sedes": list(sedes)}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error al obtener las sedes: {str(e)}")
        return Response({"error": "Ocurrió un error al obtener las sedes."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['PUT'])
@permission_classes([AllowAny])
def edit_user_view(request, user_id):
    try:
        user = UserRol.objects.get(id=user_id)
    except UserRol.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    # Serializar y actualizar datos
    serializer = UserRolSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Usuario editado exitosamente."}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def dispositivo_view(request):
    """
    Maneja la creación y listado de dispositivos.
    """
    if request.method == 'GET':
        # Obtener todos los dispositivos
        dispositivos = Dispositivo.objects.all()
        serializer = DispositivoSerializer(dispositivos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Validar y crear un nuevo dispositivo
        data = request.data

        # Obtener los campos del formulario
        tipo = data.get('tipo', '').strip()
        marca = data.get('marca', '').strip()
        modelo = data.get('modelo', '').strip()
        serial = data.get('serial', '').strip()
        estado = data.get('estado', '').strip()
        capacidad_memoria_ram = data.get('capacidad_memoria_ram', '').strip()
        capacidad_disco_duro = data.get('capacidad_disco_duro', '').strip()
        tipo_disco_duro = data.get('tipo_disco_duro', '').strip()
        tipo_memoria_ram = data.get('tipo_memoria_ram', '').strip()
        ubicacion = data.get('ubicacion', '').strip()
        razon_social = data.get('razon_social', '').strip()
        regimen = data.get('regimen', '').strip()
        placa_cu = data.get('placa_cu', '').strip()
        posicion_id = data.get('posicion', None)
        sede_id = data.get('sede', None)
        procesador = data.get('procesador', '').strip()
        sistema_operativo = data.get('sistema_operativo', '').strip()
        proveedor = data.get('proveedor', '').strip()

        # Validaciones básicas
        if not tipo or not marca or not modelo or not serial:
            return Response({"error": "Los campos tipo, marca, modelo y serial son obligatorios."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        if Dispositivo.objects.filter(serial=serial).exists():
            return Response({"error": "Ya existe un dispositivo con este número de serial."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Crear el dispositivo
            dispositivo = Dispositivo.objects.create(
                tipo=tipo,
                marca=marca,
                modelo=modelo,
                serial=serial,
                estado=estado,
                capacidad_memoria_ram=capacidad_memoria_ram,
                capacidad_disco_duro=capacidad_disco_duro,
                tipo_disco_duro=tipo_disco_duro,
                tipo_memoria_ram=tipo_memoria_ram,
                ubicacion=ubicacion,
                razon_social=razon_social,
                regimen=regimen,
                placa_cu=placa_cu,
                posicion_id=posicion_id,
                sede_id=sede_id,
                procesador=procesador,
                sistema_operativo=sistema_operativo,
                proveedor=proveedor
                
            )
            return Response({"message": "Dispositivo registrado exitosamente."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error al registrar el dispositivo: {str(e)}")
            return Response({"error": "Ocurrió un error al registrar el dispositivo."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def dispositivo_detail_view(request, dispositivo_id):
    """
    Maneja la obtención, actualización y eliminación de un dispositivo específico.
    """
    try:
        # Intentar obtener el dispositivo por su ID
        dispositivo = Dispositivo.objects.get(id=dispositivo_id)
    except Dispositivo.DoesNotExist:
        return Response({"error": "El dispositivo no existe."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Obtener los detalles del dispositivo
        serializer = DispositivoSerializer(dispositivo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Actualizar los detalles del dispositivo
        data = request.data

        # Actualizar los campos
        dispositivo.tipo = data.get('tipo', dispositivo.tipo).strip()
        dispositivo.marca = data.get('marca', dispositivo.marca).strip()
        dispositivo.modelo = data.get('modelo', dispositivo.modelo).strip()
        dispositivo.serial = data.get('serial', dispositivo.serial).strip()
        dispositivo.estado = data.get('estado', dispositivo.estado).strip()
        dispositivo.capacidad_memoria_ram = data.get('capacidad_memoria_ram', dispositivo.capacidad_memoria_ram).strip()
        dispositivo.capacidad_disco_duro = data.get('capacidad_disco_duro', dispositivo.capacidad_disco_duro).strip()
        dispositivo.tipo_disco_duro = data.get('tipo_disco_duro', dispositivo.tipo_disco_duro).strip()
        dispositivo.tipo_memoria_ram = data.get('tipo_memoria_ram', dispositivo.tipo_memoria_ram).strip()
        dispositivo.ubicacion = data.get('ubicacion', dispositivo.ubicacion).strip()
        dispositivo.razon_social = data.get('razon_social', dispositivo.razon_social).strip()
        dispositivo.regimen = data.get('regimen', dispositivo.regimen).strip()
        dispositivo.sistema_operativo = data.get('regimen', dispositivo.sistema_operativo).strip()
        dispositivo.placa_cu = data.get('placa_cu', dispositivo.placa_cu).strip()
        dispositivo.posicion = data.get('posicion', dispositivo.posicion_id)
        dispositivo.sede_id = data.get('sede', dispositivo.sede_id)
        dispositivo.procesador = data.get('procesador', dispositivo.procesador).strip()
        dispositivo.proveedor = data.get('proveedor', dispositivo.proveedor).strip()


        # Validaciones
        if not dispositivo.tipo or not dispositivo.marca or not dispositivo.modelo or not dispositivo.serial:
            return Response({"error": "Los campos tipo, marca, modelo y serial son obligatorios."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya existe otro dispositivo con el mismo serial
        if Dispositivo.objects.filter(serial=dispositivo.serial).exclude(id=dispositivo.id).exists():
            return Response({"error": "Ya existe otro dispositivo con este número de serial."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Guardar cambios
            dispositivo.save()
            return Response({"message": "Dispositivo actualizado exitosamente."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error al actualizar el dispositivo: {str(e)}")
            return Response({"error": "Ocurrió un error al actualizar el dispositivo."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        # Eliminar el dispositivo
        try:
            dispositivo.delete()
            return Response({"message": "Dispositivo eliminado exitosamente."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error al eliminar el dispositivo: {str(e)}")
            return Response({"error": "Ocurrió un error al eliminar el dispositivo."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def servicios_view(request):
    """
    Maneja la creación y listado de servicios.
    """

    if request.method == 'GET':
        # Obtener todos los servicios
        servicios = Servicios.objects.all()
        serializer = ServiciosSerializer(servicios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Crear un nuevo servicio
        data = request.data

        nombre = data.get('nombre', '').strip()
        codigo_analitico = data.get('codigo_analitico', '').strip()
        sede_id = data.get('sede')

        # Validar campos requeridos
        if not nombre:
            return Response({"error": "El campo 'nombre' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Crear el servicio
            servicio = Servicios.objects.create(
                nombre=nombre,
                codigo_analitico=codigo_analitico,
                sede_id=sede_id
            )
            return Response({"message": "Servicio creado exitosamente."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error al crear el servicio: {str(e)}")
            return Response({"error": "Ocurrió un error al crear el servicio."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def servicio_detail_view(request, servicio_id):
    """
    Maneja la obtención, actualización y eliminación de un servicio específico.
    """
    try:
        # Intentar obtener el servicio por su ID
        servicio = Servicios.objects.get(id=servicio_id)
    except Servicios.DoesNotExist:
        return Response({"error": "El servicio no existe."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Obtener los detalles del servicio
        serializer = ServiciosSerializer(servicio)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Actualizar los detalles del servicio
        data = request.data

        servicio.nombre = data.get('nombre', servicio.nombre).strip()
        servicio.codigo_analitico = data.get('codigo_analitico', servicio.codigo_analitico).strip()
        servicio.sede_id = data.get('sede', servicio.sede_id)

        # Validar campos obligatorios
        if not servicio.nombre:
            return Response({"error": "El campo 'nombre' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Guardar cambios
            servicio.save()
            return Response({"message": "Servicio actualizado exitosamente."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error al actualizar el servicio: {str(e)}")
            return Response({"error": "Ocurrió un error al actualizar el servicio."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        # Eliminar el servicio
        try:
            servicio.delete()
            return Response({"message": "Servicio eliminado exitosamente."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error al eliminar el servicio: {str(e)}")
            return Response({"error": "Ocurrió un error al eliminar el servicio."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
        
@api_view(['GET', 'POST'])  # Asegúrate de incluir 'POST' aquí
@permission_classes([AllowAny])
def sede_view(request):
    """
    Maneja la creación y listado de sedes.
    """
    if request.method == 'GET':
        # Listar todas las sedes
        sedes = Sede.objects.all()
        serializer = SedeSerializer(sedes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Crear una nueva sede
        data = request.data

        nombre = data.get('nombre', '').strip()
        direccion = data.get('direccion', '').strip()
        ciudad = data.get('ciudad', '').strip()

        # Validar campos obligatorios
        if not nombre or not direccion or not ciudad:
            return Response({"error": "Todos los campos son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sede = Sede.objects.create(nombre=nombre, direccion=direccion, ciudad=ciudad)
            return Response({"message": "Sede creada exitosamente."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error al crear la sede: {str(e)}")
            return Response({"error": "Ocurrió un error al crear la sede."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
        
        
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def sede_detail_view(request, sede_id):
    """
    Maneja la obtención, actualización y eliminación de una sede específica.
    """
    try:
        # Intentar obtener la sede por su ID
        sede = Sede.objects.get(id=sede_id)
    except Sede.DoesNotExist:
        return Response({"error": "La sede no existe."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Obtener los detalles de la sede
        serializer = SedeSerializer(sede)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Actualizar los detalles de la sede
        data = request.data

        sede.nombre = data.get('nombre', sede.nombre).strip()
        sede.direccion = data.get('direccion', sede.direccion).strip()
        sede.ciudad = data.get('ciudad', sede.ciudad).strip()

        # Validar campos obligatorios
        if not sede.nombre:
            return Response({"error": "El campo 'nombre' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Guardar cambios
            sede.save()
            return Response({"message": "Sede actualizada exitosamente."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error al actualizar la sede: {str(e)}")
            return Response({"error": "Ocurrió un error al actualizar la sede."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        # Eliminar la sede
        try:
            sede.delete()
            return Response({"message": "Sede eliminada exitosamente."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error al eliminar la sede: {str(e)}")
            return Response({"error": "Ocurrió un error al eliminar la sede."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
        
        
        
# vistas para las posiciones
class PosicionListCreateView(generics.ListCreateAPIView):
    queryset = Posicion.objects.all()
    serializer_class = PosicionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        # Verificar si ya existe
        if "id" in data and Posicion.objects.filter(id=data["id"]).exists():
            return Response({'error': 'La posición ya existe'}, status=status.HTTP_400_BAD_REQUEST)

        # Si no se proporciona un ID, generarlo automáticamente
        if "id" not in data:
            data["id"] = f"pos_{int(time.time())}"  # Genera un ID único basado en el tiempo

        # Validar y guardar
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    
    

class PosicionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Posicion.objects.all()
    serializer_class = PosicionSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"error": "Posición no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Validación de datos
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()  # Guarda los datos validados
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"error": "Posición no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        instance.delete()
        return Response({"message": "Posición eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)
    
    
    
    
    
    
    

@api_view(['GET'])
def get_colores_pisos(request):
    return Response({
        "colores": dict(Posicion.COLORES),
        "pisos": dict(Posicion.PISOS),
    })