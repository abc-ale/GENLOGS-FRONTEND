import React, { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Search, UserPlus } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'
import { consultarDocumento, type ConsultaDocumento } from '@/api/usuariosApi'
import { clientesApi } from '@/api/clientesApi'
import { listarSectoresEconomicos, type SectorEconomico } from '@/api/sectoresEconomicosApi'
import { ubigeoApi, type Departamento, type Provincia, type Distrito } from '@/api/ubigeoApi'

interface Props {
  clientes: Cliente[]
  onSeleccionar: (idCliente: number) => void
  /** Se llama tras registrar un cliente nuevo para refrescar la lista. */
  onClienteCreado?: () => void
}

const input =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

/** Solo DNI (8) o RUC (11): busca primero entre los clientes registrados y,
 *  si no existe, autocompleta con Factiliza y permite registrarlo al instante. */
export const ClienteDocumentoBuscador: React.FC<Props> = ({ clientes, onSeleccionar, onClienteCreado }) => {
  const [documento, setDocumento] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [existente, setExistente] = useState<Cliente | null>(null)
  const [nuevo, setNuevo] = useState<ConsultaDocumento | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [sectores, setSectores] = useState<SectorEconomico[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [distritos, setDistritos] = useState<Distrito[]>([])
  const [idDepartamento, setIdDepartamento] = useState(0)
  const [idProvincia, setIdProvincia] = useState(0)
  const [idDistrito, setIdDistrito] = useState(0)
  const [idSector, setIdSector] = useState(0)
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Catálogos para el alta rápida: solo se piden cuando hace falta
  useEffect(() => {
    if (!nuevo || departamentos.length > 0) return
    void (async () => {
      try {
        const [secs, paises] = await Promise.all([listarSectoresEconomicos(), ubigeoApi.paises()])
        setSectores(secs)
        const peru = paises.find((p) => p.codigoIso === 'PE') ?? paises[0]
        if (peru) setDepartamentos(await ubigeoApi.departamentos(peru.idPais))
      } catch {
        setError('No se pudieron cargar los catálogos (sectores / ubicación).')
      }
    })()
  }, [nuevo, departamentos.length])

  async function onDepartamento(id: number) {
    setIdDepartamento(id); setIdProvincia(0); setIdDistrito(0); setProvincias([]); setDistritos([])
    if (id) setProvincias(await ubigeoApi.provincias(id))
  }
  async function onProvincia(id: number) {
    setIdProvincia(id); setIdDistrito(0); setDistritos([])
    if (id) setDistritos(await ubigeoApi.distritos(id))
  }

  async function buscar(numero: string) {
    setError(null); setExistente(null); setNuevo(null)
    const yaEsCliente = clientes.find((c) => c.tercero.numeroDocumento === numero)
    if (yaEsCliente) {
      setExistente(yaEsCliente)
      onSeleccionar(yaEsCliente.id ?? yaEsCliente.idCliente)
      return
    }
    setBuscando(true)
    try {
      setNuevo(await consultarDocumento(numero))
    } catch {
      setError('No se encontró el documento. Verifica el número.')
    } finally {
      setBuscando(false)
    }
  }

  function onChange(valor: string) {
    const limpio = valor.replace(/\D/g, '').slice(0, 11)
    setDocumento(limpio)
    setExistente(null); setNuevo(null); setError(null)
    if (limpio.length === 8 || limpio.length === 11) void buscar(limpio)
  }

  async function registrar() {
    if (!nuevo) return
    if (!idDistrito || !idSector) {
      setError('Selecciona el distrito y el sector económico.')
      return
    }
    setGuardando(true); setError(null)
    try {
      const creado = await clientesApi.crear({
        tercero: {
          idTipoDocumento: nuevo.tipoDocumento === 'RUC' ? 1 : 2,
          idDistrito,
          numeroDocumento: nuevo.numeroDocumento,
          razonSocial: nuevo.razonSocial ?? '',
          direccion: nuevo.direccion ?? undefined,
          telefono: telefono || undefined,
          correo: correo || undefined,
        },
        idSectorEconomico: idSector,
        situacion: 'ACTIVO',
      })
      onClienteCreado?.()
      onSeleccionar(creado.id ?? creado.idCliente)
      setExistente(creado)
      setNuevo(null)
    } catch {
      setError('No se pudo registrar el cliente. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          inputMode="numeric"
          value={documento}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ingresa DNI (8 dígitos) o RUC (11 dígitos)"
          className={`${input} pr-10`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </span>
      </div>
      {documento.length > 0 && documento.length !== 8 && documento.length !== 11 && (
        <p className="text-xs text-muted-foreground">Ingresa 8 dígitos (DNI) u 11 (RUC).</p>
      )}

      {existente && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <p className="font-medium text-foreground">{existente.tercero.razonSocial}</p>
            <p className="text-xs text-muted-foreground">Cliente registrado · {existente.tercero.numeroDocumento}</p>
          </div>
        </div>
      )}

      {nuevo && (
        <div className="space-y-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-2">
            <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{nuevo.razonSocial}</p>
              <p className="text-xs text-muted-foreground">
                {nuevo.tipoDocumento} {nuevo.numeroDocumento} · aún no es cliente
                {nuevo.simulado ? ' · datos simulados (falta FACTILIZA_API_KEY)' : ''}
              </p>
              {nuevo.direccion && <p className="text-xs text-muted-foreground">{nuevo.direccion}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select className={input} value={idDepartamento} onChange={(e) => void onDepartamento(Number(e.target.value))}>
              <option value={0}>Departamento</option>
              {departamentos.map((d) => <option key={d.idDepartamento} value={d.idDepartamento}>{d.nombreDepartamento}</option>)}
            </select>
            <select className={input} value={idProvincia} disabled={!idDepartamento} onChange={(e) => void onProvincia(Number(e.target.value))}>
              <option value={0}>Provincia</option>
              {provincias.map((p) => <option key={p.idProvincia} value={p.idProvincia}>{p.nombreProvincia}</option>)}
            </select>
            <select className={input} value={idDistrito} disabled={!idProvincia} onChange={(e) => setIdDistrito(Number(e.target.value))}>
              <option value={0}>Distrito</option>
              {distritos.map((d) => <option key={d.idDistrito} value={d.idDistrito}>{d.nombreDistrito}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select className={input} value={idSector} onChange={(e) => setIdSector(Number(e.target.value))}>
              <option value={0}>Sector económico</option>
              {sectores.map((s) => <option key={s.idSectorEconomico} value={s.idSectorEconomico}>{s.nombreSector}</option>)}
            </select>
            <input className={input} placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input className={input} type="email" placeholder="Correo (opcional)" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>

          <button
            type="button"
            onClick={() => void registrar()}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar y usar como cliente
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}