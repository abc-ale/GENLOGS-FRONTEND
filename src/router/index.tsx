import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { RoleGuard } from '@/router/RoleGuard'
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

export const router = createBrowserRouter([
  { element: <AuthLayout />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/recuperar-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
  ] },
  { element: <ProtectedRoute />, children: [{ element: <AppLayout />, children: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/clientes', element: <ClientesListPage /> },
    { path: '/clientes/:id', element: <ClienteDetallePage /> },
    { path: '/proveedores', element: <ProveedoresListPage /> },
    { path: '/empresas-mineras', element: <EmpresasMinerasPage /> },
    { path: '/catalogo-repuestos', element: <CatalogoProductosPage /> },
    { path: '/catalogo-repuestos/nuevo', element: <NuevoProductoPage /> },
    { path: '/catalogo-repuestos/:id', element: <ProductoDetallePage /> },
    { path: '/catalogo-repuestos/:id/editar', element: <EditarProductoPage /> },
    { path: '/catalogo-servicios', element: <CatalogoServiciosPage /> },
    { path: '/reportes', element: <ReportesPage /> },
    { path: '/cotizaciones', element: <CotizacionesListPage /> },
    { path: '/cotizaciones/nueva', element: <NuevaCotizacionPage /> },
    { path: '/cotizaciones/:id', element: <CotizacionDetallePage /> },
    { path: '/ordenes-compra', element: <OrdenesCompraPage /> },
    { path: '/facturacion', element: <FacturacionPage /> },
    { element: <RoleGuard allowedRoles={['ADMINISTRADOR']} />, children: [{ path: '/usuarios', element: <UsuariosPage /> }] },
  ] }] },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
