import json
from django.core.management.base import BaseCommand
from django.db import connection
from dispositivos.models import Posicion, Sede

class Command(BaseCommand):
    help = 'Carga los datos del JSON en el modelo Posicion'

    ESTADO_MAP = {
        "available": "disponible",
        "occupied": "ocupado",
        "reserved": "reservado",
        "inactive": "inactivo"
    }

    COLOR_MAP = {
        "default": "green",
        "yellow": "yellow",
        "red-mark": "red",
        "red-dot": "red",
        "orange": "yellow",  
        "gray": "gray"
    }

    PISO_MAP = {
        "Piso 1": "PISO1",
        "Piso 2": "PISO2",
        "Piso 3": "PISO3",
        "Piso 4": "PISO4",
        "Torre 1": "TORRE1"
    }

    def handle(self, *args, **kwargs):
        # 🔴 Eliminar todas las posiciones existentes para evitar duplicados
        Posicion.objects.all().delete()

        # 🔵 Resetear la secuencia del ID en PostgreSQL
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval('dispositivos_posicion_id_seq', COALESCE((SELECT MAX(id) FROM dispositivos_posicion), 1), false);"
            )

        json_data = '''
        {
            "sections": [
                {
                    "name": "Cafeteria",
                    "type": "area",
                    "position": {"x": 0, "y": 0},
                    "cells": []
                },
                {
                    "name": "Sala Capacitaciones",
                    "type": "room",
                    "position": {"x": 0, "y": 100},
                    "cells": [
                        {
                            "id": "E001",
                            "status": "available",
                            "color": "yellow",
                            "position": {"x": 70, "y": 220},
                            "floor": "Piso 1",
                            "name": "Espacio E001",
                            "description": "Sala de reuniones pequeña."
                        },
                        {
                            "id": "E002",
                            "status": "available",
                            "color": "yellow",
                            "position": {"x": 120, "y": 220},
                            "floor": "Torre 1",
                            "name": "Espacio E002",
                            "description": "Sala de reuniones pequeña."
                        }
                    ]
                },
                {
                    "name": "Bottom Cells",
                    "type": "area",
                    "position": {"x": 0, "y": 200},
                    "cells": [
                        {
                            "id": "E003",
                            "status": "available",
                            "color": "default",
                            "position": {"x": 20, "y": 340},
                            "floor": "Piso 1",
                            "name": "Espacio E003",
                            "description": "Área de trabajo individual."
                        },
                        {
                            "id": "E004",
                            "status": "available",
                            "color": "default",
                            "position": {"x": 70, "y": 340},
                            "floor": "Torre 1",
                            "name": "Espacio E004",
                            "description": "Área de trabajo individual."
                        },
                        {
                            "id": "E005",
                            "status": "available",
                            "color": "default",
                            "position": {"x": 120, "y": 340},
                            "floor": "Piso 1",
                            "name": "Espacio E005",
                            "description": "Área de trabajo individual."
                        },
                        {
                            "id": "E006",
                            "status": "reserved",
                            "color": "red-mark",
                            "position": {"x": 170, "y": 340},
                            "floor": "Torre 1",
                            "name": "Espacio E006",
                            "description": "Área de trabajo reservada."
                        },
                        {
                            "id": "E007",
                            "status": "available",
                            "color": "default",
                            "position": {"x": 20, "y": 500},
                            "floor": "Piso 1",
                            "name": "Espacio E007",
                            "description": "Área de trabajo individual."
                        },
                        {
                            "id": "E008",
                            "status": "reserved",
                            "color": "red-dot",
                            "position": {"x": 70, "y": 500},
                            "floor": "Torre 1",
                            "name": "Espacio E008",
                            "description": "Área de trabajo reservada."
                        },
                        {
                            "id": "E009",
                            "status": "available",
                            "color": "orange",
                            "position": {"x": 120, "y": 500},
                            "floor": "Piso 1",
                            "name": "Espacio E009",
                            "description": "Área de trabajo compartida."
                        },
                        {
                            "id": "E010",
                            "status": "available",
                            "color": "default",
                            "position": {"x": 170, "y": 500},
                            "floor": "Torre 1",
                            "name": "Espacio E010",
                            "description": "Área de trabajo individual."
                        }
                    ]
                }
            ]
        }
        '''

        data = json.loads(json_data)

        # ✅ Crear un conjunto para evitar duplicados
        posiciones_creadas = set()

        sede, created = Sede.objects.get_or_create(nombre="Sede Principal")

        for section in data['sections']:
            for cell in section['cells']:
                estado = self.ESTADO_MAP.get(cell['status'], 'disponible')
                color = self.COLOR_MAP.get(cell['color'], 'gray')
                piso = self.PISO_MAP.get(cell['floor'], 'PISO1')

                # Generar clave única combinando valores clave
                unique_key = f"{cell['id']}-{cell['position']['x']}-{cell['position']['y']}"

                if unique_key not in posiciones_creadas:
                    Posicion.objects.create(
                        sede=sede,
                        nombre=cell['name'],
                        piso=piso,
                        coordenada_x=cell['position']['x'],
                        coordenada_y=cell['position']['y'],
                        estado=estado,
                        color=color,
                        descripcion=cell.get('description', '')
                    )
                    posiciones_creadas.add(unique_key)  # Agregar al conjunto

        self.stdout.write(self.style.SUCCESS('✅ Datos cargados exitosamente'))