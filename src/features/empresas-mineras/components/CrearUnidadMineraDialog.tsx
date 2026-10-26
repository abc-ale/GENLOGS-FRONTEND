import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { X } from 'lucide-react'
import { axiosClient } from '@/api/axiosClient'
import { clientesApi } from '@/api/clientesApi'
import { useCrearEmpresaMinera, useEmpresasMineras } from '../hooks/useEmpresasMineras'
import type { EmpresaMineraInput, EtapaComercialMinera, TipoOperacionMinera } from '@/types/empresaMinera.types'

interface Props { onClose: () => void }
const field = 'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'

export function CrearUnidadMineraDialog({ onClose }: Props) {
  const [error, setError] = useState('')
  const { data: empresas = [] } = useEmpresasMineras()
  const clientes = useQuery({ queryKey: ['clientes', 'alta-unidad-minera'], queryFn: () => clientesApi.listar({ situacion: 'ACTIVO', size: 500 }) })
  const etapas = useQuery({ queryKey: ['catalogos', 'etapas-comerciales-minera'], queryFn: () => axiosClient.get<EtapaComercialMinera[]>('/catalogos/etapas-comerciales-minera').then(r => r.data) })
  const operaciones = useQuery({ queryKey: ['catalogos', 'tipos-operacion-minera'], queryFn: () => axiosClient.get<TipoOperacionMinera[]>('/catalogos/tipos-operacion-minera').then(r => r.data) })
  const crear = useCrearEmpresaMinera()
  const yaRegistrados = new Set(empresas.map(e => e.cliente?.idCliente ?? e.idCliente))

  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <form className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl" onSubmit={async e => {
      e.preventDefault(); setError(''); const f = new FormData(e.currentTarget)
      const input: EmpresaMineraInput = { idCliente: Number(f.get('cliente')), idEtapaComercial: Number(f.get('etapa')), idTipoOperacion: Number(f.get('operacion')), nombreUnidadMinera: String(f.get('nombre')).trim(), latitud: Number(f.get('latitud')), longitud: Number(f.get('longitud')), altitudMsnm: f.get('altitud') ? Number(f.get('altitud')) : null, capacidadProduccion: String(f.get('capacidad') || ''), descripcion: String(f.get('descripcion') || '') }
      try { await crear.mutateAsync(input); onClose() } catch { setError('No se pudo guardar. Revisa los campos y confirma que el cliente no tenga otra unidad minera registrada.') }
    }}>
      <header className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-semibold">Agregar unidad minera</h2><p className="mt-1 text-sm text-muted-foreground">Asocia la operación a un cliente y ubícala en el mapa.</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4"/></button></header>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {(clientes.isError || etapas.isError || operaciones.isError) && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">No se pudieron cargar los catálogos requeridos. Vuelve a intentar.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm sm:col-span-2">Cliente<select name="cliente" required className={field}><option value="">Seleccionar cliente</option>{(clientes.data ?? []).filter(c => !yaRegistrados.has(c.idCliente)).map(c => <option key={c.idCliente} value={c.idCliente}>{c.tercero.nombreComercial || c.tercero.razonSocial} · {c.tercero.numeroDocumento}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">Nombre de unidad minera<input name="nombre" required maxLength={150} className={field} placeholder="Ej. U.M. Marcona"/></label>
        <label className="grid gap-1.5 text-sm">Etapa comercial<select name="etapa" required className={field}><option value="">Seleccionar etapa</option>{(etapas.data ?? []).filter(e => e.status === 'A').map(e => <option key={e.idEtapaComercial} value={e.idEtapaComercial}>{e.nombreEtapa}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm">Tipo de operación<select name="operacion" required className={field}><option value="">Seleccionar tipo</option>{(operaciones.data ?? []).filter(o => o.status === 'A').map(o => <option key={o.idTipoOperacion} value={o.idTipoOperacion}>{o.nombreOperacion}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm">Latitud<input name="latitud" type="number" step="any" min="-19.5" max="0.5" required className={field} placeholder="-9.1900"/></label>
        <label className="grid gap-1.5 text-sm">Longitud<input name="longitud" type="number" step="any" min="-82" max="-68" required className={field} placeholder="-75.0152"/></label>
        <label className="grid gap-1.5 text-sm">Altitud (m s. n. m.)<input name="altitud" type="number" min="0" className={field}/></label>
        <label className="grid gap-1.5 text-sm">Capacidad de producción<input name="capacidad" maxLength={100} className={field} placeholder="Ej. 10 Mt/año"/></label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">Descripción<textarea name="descripcion" rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"/></label>
      </div>
      <footer className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button><button disabled={crear.isPending || clientes.isLoading || etapas.isLoading || operaciones.isLoading} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{crear.isPending ? 'Guardando…' : 'Guardar unidad minera'}</button></footer>
    </form>
  </div>
}
