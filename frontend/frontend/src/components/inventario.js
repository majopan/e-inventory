"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Search, Trash2, FileText, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import * as XLSX from "xlsx"
import '../styles/Inventario.css';

const Inventario = () => {
  const [dispositivos, setDispositivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filtros, setFiltros] = useState({ tipo: "", estado: "", sede: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  useEffect(() => {
    const fetchDispositivos = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://127.0.0.1:8000/api/dispositivos/");
            
            console.log("Respuesta completa de la API:", response); // ✅ Verifica que la respuesta sea correcta
            console.log("Datos recibidos:", response.data);
            console.log("Primer dispositivo:", response.data[0]);

            
            setDispositivos(response.data); // ✅ `response.data` ya contiene los dispositivos
        } catch (error) {
            console.error("Error al obtener dispositivos:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchDispositivos(); // Llamada a la función
}, []);



const fetchDispositivos = async () => {
  try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/dispositivos/");
      return response;  // ⬅️ Retorna la respuesta para que useEffect pueda manejarla
  } catch (error) {
      console.error("Error al obtener dispositivos", error);
      throw error; // ⬅️ Lanza el error para que useEffect pueda capturarlo
  } finally {
      setLoading(false);
  }
};

  const handleDelete = async (deviceId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/dispositivos/${deviceId}/`)
      fetchDispositivos()
    } catch (error) {
      console.error("Error al eliminar el dispositivo", error)
    }
  }

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dispositivos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")
    XLSX.writeFile(wb, "Inventario.xlsx")
  }

  const filteredDispositivos = dispositivos
    .filter(
      (dispositivo) =>
        dispositivo.modelo.toLowerCase().includes(search.toLowerCase()) ||
        dispositivo.marca.toLowerCase().includes(search.toLowerCase()) ||
        dispositivo.serial.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (dispositivo) =>
        (filtros.tipo ? dispositivo.tipo === filtros.tipo : true) &&
        (filtros.estado ? dispositivo.estado === filtros.estado : true) &&
        (filtros.sede ? dispositivo.sede && dispositivo.sede.nombre === filtros.sede : true),
    )

  const pageCount = Math.ceil(filteredDispositivos.length / itemsPerPage)
  const currentItems = filteredDispositivos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Datos para las gráficas
  const dispositivosPorTipo = dispositivos.reduce((acc, dispositivo) => {
    acc[dispositivo.tipo] = (acc[dispositivo.tipo] || 0) + 1
    return acc
  }, {})

  const dispositivosPorProveedor = dispositivos.reduce((acc, dispositivo) => {
    acc[dispositivo.marca] = (acc[dispositivo.marca] || 0) + 1
    return acc
  }, {})

  const tipoChartData = Object.entries(dispositivosPorTipo).map(([tipo, cantidad]) => ({
    name: tipo,
    value: cantidad,
  }))

  const proveedorChartData = Object.entries(dispositivosPorProveedor).map(([marca, cantidad]) => ({
    name: marca,
    value: cantidad,
  }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"]

  return (
    <div className="inventory-containert">

      <div className="main-content">
      <div className="filters-containert">
          <div className="search-containert">
            <Search className="search-icont" />
            <input
              type="text"
              placeholder="Buscar..."
              className="search-inputt"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            <option value="COMPUTADOR">Computador</option>
            <option value="MONITOR">Monitor</option>
          </select>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="BUENO">Bueno</option>
            <option value="MALO">Malo</option>
          </select>
        </div>
        <div className="metric-cardst">
          <div className="metric-cardt">
            <h2 className="metric-titlet">Total dispositivos</h2>
            <p className="metric-valuet">{dispositivos.length}</p>
          </div>
          <div className="metric-cardt">
            <h2 className="metric-titlet">Dispositivos en uso</h2>
            <p className="metric-valuet">{dispositivos.filter((d) => d.estado === "BUENO").length}</p>
          </div>
          <div className="metric-cardt">
            <h2 className="metric-titlet">Dispositivos disponibles</h2>
            <p className="metric-valuet">{dispositivos.filter((d) => d.estado === "MALO").length}</p>
          </div>
        </div>



        <div className="action-buttonst">
          <button className="action-buttont">
            Importar Excel
            <ArrowRight size={16} />
          </button>
          <button className="action-buttont">
            Crear Dispositivo
            <ArrowRight size={16} />
          </button>
          <button onClick={handleExportExcel} className="action-buttont">
            <FileText size={16} />
            Exportar Excel
          </button>
        </div>

        <div className="table-containert">
          <table className="inventory-tablet">
            <thead>
              <tr>
                {["Tipo", "Fabricante", "Modelo", "Serial", "Estado", "Sede","Piso","Posicion","ubicacion","Servicio","codigo analitico","CU","Sistema operativo","Procesador","Disco duro","Memoria ram","proveedor","estado propiedad","razon social","Regimen", "Acciones"].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                    Cargando...
                  </td>
                </tr>
              ) : (
                currentItems.map((dispositivo) => (
                  <tr key={dispositivo.id}>
                    <td>{dispositivo.tipo}</td>
                    <td>{dispositivo.marca}</td>
                    <td>{dispositivo.modelo}</td>
                    <td>{dispositivo.serial}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          backgroundColor: dispositivo.estado === "BUENO" ? "#10B981" : "#EF4444",
                          color: "#ffffff",
                        }}
                      >
                        {dispositivo.estado}
                      </span>
                    </td>
                    <td>{dispositivo.nombre_sede || "no asignada"}</td>
                    <td>{dispositivo.piso}</td>
                    <td>{dispositivo.posicion}</td>
                    <td>{dispositivo.ubicacion}</td>
                    <td>{dispositivo.servicio}</td>
                    <td>{dispositivo.codigo_analitico}</td>
                    <td>{dispositivo.placa_cu}</td>
                    <td>{dispositivo.sistema_operativo}</td>
                    <td>{dispositivo.procesador}</td>
                    <td>{dispositivo.capacidad_disco_duro}</td>
                    <td>{dispositivo.capacidad_memoria_ram}</td>
                    <td>{dispositivo.proveedor}</td>
                    <td>{dispositivo.estado_propiedad}</td>
                    <td>{dispositivo.razon_social}</td>
                    <td>{dispositivo.regimen}</td>

        
                    
                    <td>
                      <button onClick={() => handleDelete(dispositivo.id)} className="delete-buttont">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="paginationt">
            <div className="pagination-infot">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredDispositivos.length)} de {filteredDispositivos.length}{" "}
              resultados
            </div>
            <div className="pagination-buttonst">
              <button
                onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-buttont"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((old) => Math.min(old + 1, pageCount))}
                disabled={currentPage === pageCount}
                className="pagination-buttont"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          <div className="chart-containert">
            <h2 className="chart-titlet">Dispositivos por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tipoChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tipoChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-containert">
            <h2 className="chart-titlet">Dispositivos por Proveedor</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proveedorChartData}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventario