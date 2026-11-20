import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { RoleGuard } from '@/router/RoleGuard'
import { InicioPorRol } from '@/router/InicioPorRol'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/components/ResetPasswordPage'
import { UsuariosPage } from '@/features/usuarios/components/UsuariosPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { CatalogoProductosPage } from '@/features/catalogo-repuestos/pages/CatalogoProductosPage'
import { ProductoDetallePage } from '@/features/catalogo-repuestos/pages/ProductoDetallePage'
import { NuevoProductoPage } from '@/features/catalogo-repuestos/pages/NuevoProductoPage'
import { EditarProductoPage } from '@/features/catalogo-repuestos/pages/EditarProductoPage'
import { CatalogoServiciosPage } from '@/features/catalogo-servicios/pages/CatalogoServiciosPage'
import { ReportesPage } from '@/features/reportes/pages/ReportesPage'
import { CotizacionesListPage } from '@/features/cotizaciones/pages/CotizacionesListPage'
import { NuevaCotizacionPage } from '@/features/cotizaciones/pages/NuevaCotizacionPage'
import { CotizacionDetallePage } from '@/features/cotizaciones/pages/CotizacionDetallePage'
import ClientesListPage from '@/features/clientes-proveedores/pages/ClientesListPage'
import ClienteDetallePage from '@/features/clientes-proveedores/pages/ClienteDetallePage'
import ProveedoresListPage from '@/features/clientes-proveedores/pages/ProveedoresListPage'
import { EmpresasMinerasPage } from '@/features/empresas-mineras/pages/EmpresasMinerasPage'
import { OrdenesCompraPage } from '@/features/ordenes-compra/pages/OrdenesCompraPage'
import { FacturacionPage } from '@/features/facturacion/pages/FacturacionPage'
import { CatalogosMaestrosPage } from '@/features/catalogos-maestros/pages/CatalogosMaestrosPage'
import { CatalogoPublicoPage } from '@/features/catalogo-publico/pages/CatalogoPublicoPage'

export const router = createBrowserRouter([
  // Catálogo web público (RF-16): fuera de ProtectedRoute, no pide sesión.
  { path: '/catalogo', element: <CatalogoPublicoPage /> },
  { element: <AuthLayout />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/recuperar-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
  ] },
  { element: <ProtectedRoute />, children: [{ element: <AppLayout />, children: [
    // "/" lleva a la pantalla de inicio de cada rol (el Asesor no tiene Dashboard).
    { path: '/', element: <InicioPorRol /> },
    // Permisos por rol (RF-31): misma matriz que el backend, en src/lib/permisos.ts.
    { path: '/clientes', element: <ClientesListPage /> },
    { path: '/clientes/:id', element: <ClienteDetallePage /> },
    { path: '/proveedores', element: <ProveedoresListPage /> },
    { path: '/empresas-mineras', element: <EmpresasMinerasPage /> },
    { path: '/catalogo-repuestos', element: <CatalogoProductosPage /> },
    { path: '/catalogo-repuestos/:id', element: <ProductoDetallePage /> },
    { path: '/catalogo-servicios', element: <CatalogoServiciosPage /> },
    { path: '/cotizaciones', element: <CotizacionesListPage /> },
    { path: '/cotizaciones/:id', element: <CotizacionDetallePage /> },
    { path: '/ordenes-compra', element: <OrdenesCompraPage /> },
    { element: <RoleGuard permiso="ver.dashboard" />, children: [{ path: '/dashboard', element: <DashboardPage /> }] },
    { element: <RoleGuard permiso="ver.reportes" />, children: [{ path: '/reportes', element: <ReportesPage /> }] },
    { element: <RoleGuard permiso="ver.facturacion" />, children: [{ path: '/facturacion', element: <FacturacionPage /> }] },
    { element: <RoleGuard permiso="cotizaciones.gestionar" />, children: [{ path: '/cotizaciones/nueva', element: <NuevaCotizacionPage /> }] },
    { element: <RoleGuard permiso="productos.gestionar" />, children: [
      { path: '/catalogo-repuestos/nuevo', element: <NuevoProductoPage /> },
      { path: '/catalogo-repuestos/:id/editar', element: <EditarProductoPage /> },
    ] },
    { element: <RoleGuard permiso="ver.usuarios" />, children: [{ path: '/usuarios', element: <UsuariosPage /> }] },
    { element: <RoleGuard permiso="ver.catalogosMaestros" />, children: [{ path: '/catalogos-maestros', element: <CatalogosMaestrosPage /> }] },
  ] }] },
  { path: '*', element: <InicioPorRol /> },
])
