interface Props { disabled?: boolean }
/** En V8 clientes y proveedores son roles sobre tercero; no existe idProveedor. */
export function VinculoProveedorToggle({ disabled = true }: Props) { return <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">Cliente/proveedor se gestiona como rol independiente sobre el mismo tercero.{disabled ? '' : ''}</p> }
