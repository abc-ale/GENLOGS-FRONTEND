import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface PuntoMapa {
  id: number
  nombre: string
  lat: number
  lon: number
  color: string
}

interface MapaUnidadesProps {
  puntos: PuntoMapa[]
  seleccionado: number | null
  onSeleccionar: (id: number) => void
  className?: string
}

/** Centro y zoom por defecto: todo el Perú. */
const CENTRO_PERU: [number, number] = [-9.19, -75.0]

/** Ajusta la vista a los puntos visibles cada vez que cambian (filtros). */
function AjustarVista({ puntos }: { puntos: PuntoMapa[] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 0) {
      map.setView(CENTRO_PERU, 5)
      return
    }
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lon], 8)
      return
    }
    const limites: LatLngBoundsExpression = puntos.map((p) => [p.lat, p.lon])
    map.fitBounds(limites, { padding: [40, 40], maxZoom: 8 })
  }, [map, puntos])
  return null
}

/** Mapa de OpenStreetMap con un círculo por unidad minera, coloreado por su
 *  etapa comercial. Al hacer clic se selecciona la unidad. */
export function MapaUnidades({ puntos, seleccionado, onSeleccionar, className }: MapaUnidadesProps) {
  return (
    // relative z-0: los paneles de Leaflet usan z-index 400+; así quedan por
    // debajo del header fijo y del menú móvil en vez de taparlos al hacer scroll.
    <div className={`relative z-0 overflow-hidden rounded-lg ${className ?? ''}`}>
      <MapContainer center={CENTRO_PERU} zoom={5} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <AjustarVista puntos={puntos} />
        {puntos.map((p) => {
          const activo = p.id === seleccionado
          return (
            <CircleMarker
              // La key incluye la selección: react-leaflet no actualiza
              // `permanent` del Tooltip después de crearlo, así que se recrea.
              key={`${p.id}-${activo ? 'activo' : 'normal'}`}
              center={[p.lat, p.lon]}
              radius={activo ? 11 : 8}
              pathOptions={{ color: '#FFFFFF', weight: activo ? 3 : 2, fillColor: p.color, fillOpacity: 1 }}
              eventHandlers={{ click: () => onSeleccionar(p.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent={activo}>
                {p.nombre}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
