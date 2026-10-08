import type { ContactoTercero, ContactoTerceroInput, Tercero, TerceroInput } from './tercero.types'
export interface Proveedor { idProveedor: number; id?: number; idTercero: number; situacion: string; status: 'A' | 'I'; tercero: Tercero; contactos: ContactoTercero[] }
export interface ProveedorInput { tercero: TerceroInput; situacion?: string }
export type ProveedorRequest = ProveedorInput
export type ContactoProveedor = ContactoTercero
export type ContactoProveedorRequest = ContactoTerceroInput
export type ContactoCliente = ContactoTercero
export type ContactoClienteRequest = ContactoTerceroInput
