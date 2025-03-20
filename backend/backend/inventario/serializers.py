from rest_framework import serializers # type: ignore
from django.contrib.auth import authenticate # type: ignore
from django.contrib.auth.hashers import make_password # type: ignore
from django.contrib.auth import authenticate# type: ignore
from .models import UserRol, Sede, Dispositivo, Servicios, Posicion

class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = ['id', 'nombre', 'ciudad', 'direccion']


class UserRolSerializer(serializers.ModelSerializer):
    sedes = SedeSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False)  # 🔹 Añadido correctamente

    class Meta:
        model = UserRol
        fields = ['id', 'username', 'nombre', 'email', 'rol', 'celular', 'documento', 'sedes', 'password', 'is_active']

    def create(self, validated_data):
        # 🔹 Verificar si 'password' está en los datos antes de intentar hashearlo
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
    
    
class DispositivoSerializer(serializers.ModelSerializer):
    sede = serializers.PrimaryKeyRelatedField(queryset=Sede.objects.all(), required=False)  # Relación con sede
    posicion = serializers.PrimaryKeyRelatedField(queryset=Posicion.objects.all(), required=False)  # Relación con posición
    servicio = serializers.PrimaryKeyRelatedField(queryset=Servicios.objects.all(), required=False)  # Relación con servicio
    codigo_analitico = serializers.CharField(source='servicio.codigo_analitico', read_only=True)  # Código analítico del servicio
    nombre_servicio = serializers.CharField(source='servicio.nombre', read_only=True)  # Nombre del servicio
    estado_propiedad = serializers.CharField(required=False, allow_blank=True)  # Estado de propiedad del dispositivo

    class Meta:
        model = Dispositivo
        fields = [
            'id', 'tipo', 'estado', 'marca', 'razon_social', 'regimen', 'modelo', 'serial',
            'placa_cu', 'posicion', 'sede', 'servicio', 'codigo_analitico', 'nombre_servicio',
            'tipo_disco_duro', 'capacidad_disco_duro', 'tipo_memoria_ram', 'capacidad_memoria_ram',
            'ubicacion', 'sistema_operativo', 'procesador', 'proveedor', 'estado_propiedad'
        ]

    def create(self, validated_data):
        # Obtener relaciones desde `initial_data` si están presentes
        sede_data = self.initial_data.get('sede')
        posicion_data = self.initial_data.get('posicion')
        servicio_data = self.initial_data.get('servicio')

        # Buscar objetos en la base de datos o dejarlos en `None`
        sede = Sede.objects.get(id=sede_data) if sede_data else None
        posicion = Posicion.objects.get(id=posicion_data) if posicion_data else None
        servicio = Servicios.objects.get(id=servicio_data) if servicio_data else None

        # Asignar las relaciones al objeto `Dispositivo`
        validated_data['sede'] = sede
        validated_data['posicion'] = posicion
        validated_data['servicio'] = servicio

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Manejar las relaciones en la actualización
        sede_data = self.initial_data.get('sede')
        posicion_data = self.initial_data.get('posicion')
        servicio_data = self.initial_data.get('servicio')

        instance.sede = Sede.objects.get(id=sede_data) if sede_data else instance.sede
        instance.posicion = Posicion.objects.get(id=posicion_data) if posicion_data else instance.posicion
        instance.servicio = Servicios.objects.get(id=servicio_data) if servicio_data else instance.servicio

        return super().update(instance, validated_data)
    
    
    
    


class PosicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posicion
        fields = '__all__'

    def validate(self, data):
        # Verificar que las celdas combinadas no se superpongan
        merged_cells = data.get('mergedCells', [])
        instance = self.instance  # Obtener la instancia actual si estamos actualizando
        
        for cell in merged_cells:
            row = cell.get('row')
            col = cell.get('col')
            
            # Consulta para encontrar posiciones que ocupan esta celda
            query = Posicion.objects.filter(
                piso=data.get('piso', instance.piso if instance else None),
                mergedCells__contains=[{'row': row, 'col': col}]
            )
            
            # Si estamos actualizando, excluir la posición actual de la verificación
            if instance:
                query = query.exclude(id=instance.id)
            
            if query.exists():
                raise serializers.ValidationError(f"La celda {row}-{col} ya está ocupada.")
        
        # Validación de fila y columna
        if data.get("fila") is not None and data.get("fila") < 1:
            raise serializers.ValidationError("La fila debe ser un número positivo.")
        
        if data.get("columna") is not None and not data.get("columna").isalpha():
            raise serializers.ValidationError("La columna debe contener solo letras.")

        return data
    
    
    
    
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    sede_id = serializers.IntegerField()  # Asegúrate de que el campo se llame `sede_id`

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        sede_id = data.get('sede_id')

        if username and password and sede_id:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Cuenta inactiva.")
                
                # Verificar si el usuario tiene acceso a la sede proporcionada
                if not user.sedes.filter(id=sede_id).exists() and user.rol != 'admin':
                    raise serializers.ValidationError("No tienes acceso a esta sede.")
                
                data['user'] = user  # Agregar el usuario a `data`
            else:
                raise serializers.ValidationError("Credenciales inválidas.")
        else:
            raise serializers.ValidationError("Debe proporcionar nombre de usuario, contraseña y sede.")
        return data
    
    
    
    
    
class ServiciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = '__all__'