import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  Truck,
  Package,
  Receipt,
  Building2,
  BarChart3,
  UserCog,
  LogOut,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import logoGenlogs from '../assets/GENLOGS.png';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { GlobalSearchDialog } from '@/components/ui/GlobalSearchDialog';

type NavItem = { label: string; path: string; icon: React.ElementType };

/** Un solo menú, una sola columna: todos los módulos en el mismo orden. */
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cotizaciones', path: '/cotizaciones', icon: FileText },
  { label: 'Órdenes de compra', path: '/ordenes-compra', icon: ShoppingCart },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Proveedores', path: '/proveedores', icon: Truck },
];

const catalogoSubItems: NavItem[] = [
  { label: 'Repuestos', path: '/catalogo-repuestos', icon: Package },
  { label: 'Servicios', path: '/catalogo-servicios', icon: Package },
];

const adminNavItems: NavItem[] = [
  { label: 'Facturación', path: '/facturacion', icon: Receipt },
  { label: 'Empresas mineras', path: '/empresas-mineras', icon: Building2 },
  { label: 'Reportes', path: '/reportes', icon: BarChart3 },
  { label: 'Usuarios', path: '/usuarios', icon: UserCog },
];

function linkClass(isActive: boolean) {
  return `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    isActive
      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;
}

function inicialesDe(nombre: string | null) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  const primeras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return primeras.join('') || nombre[0]?.toUpperCase() || '?';
}

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatalogoOpen, setIsCatalogoOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBusquedaAbierta, setIsBusquedaAbierta] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const nombreUsuario = useAuthStore((s) => s.nombreUsuario);
  const nombreRol = useAuthStore((s) => s.nombreRol);
  const logout = useAuthStore((s) => s.logout);
  const { tema, alternarTema } = useTheme();

  const closeMenu = () => setIsMenuOpen(false);

  const isCatalogoActive =
    location.pathname.startsWith('/catalogo-repuestos') ||
    location.pathname.startsWith('/catalogo-servicios');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsBusquedaAbierta(true);
      }
    }
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    logout();
    setIsUserMenuOpen(false);
    closeMenu();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo centrado, sin texto adicional */}
      <Link
        to="/dashboard"
        onClick={closeMenu}
        className="flex items-center justify-center px-6 pb-5 pt-6 focus-visible:outline-none"
        aria-label="GenLogs — ir al dashboard"
      >
        <img
          src={logoGenlogs}
          alt="GenLogs"
          width={192}
          height={80}
          className="h-14 w-auto max-w-full object-contain transition-[filter] dark:brightness-[1.9] dark:saturate-[1.3] dark:drop-shadow-[0_0_12px_rgba(77,184,245,0.35)]"
        />
      </Link>

      <div className="mx-5 h-px bg-border" />

      {/* Una sola columna */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMenu}
            className={() => linkClass(location.pathname.startsWith(item.path))}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}

        <div>
          <button
            type="button"
            onClick={() => setIsCatalogoOpen((v) => !v)}
            aria-expanded={isCatalogoOpen || isCatalogoActive}
            className={`w-full ${linkClass(isCatalogoActive && !isCatalogoOpen)}`}
          >
            <Package className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1 text-left">Catálogo</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isCatalogoOpen || isCatalogoActive ? 'rotate-180' : ''}`}
            />
          </button>
          {(isCatalogoOpen || isCatalogoActive) && (
            <div className="ml-[1.35rem] mt-1 space-y-1 border-l border-border pl-3">
              {catalogoSubItems.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  onClick={closeMenu}
                  className={() => linkClass(location.pathname.startsWith(sub.path))}
                >
                  {sub.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMenu}
            className={() => linkClass(location.pathname.startsWith(item.path))}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* Menú fijo de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        {sidebar}
      </aside>

      {/* Menú móvil (drawer) */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeMenu} aria-hidden="true" />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
          >
            <button
              onClick={closeMenu}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsBusquedaAbierta(true)}
            className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm text-muted-foreground transition-colors hover:border-accent/50 sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Buscar…</span>
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBusquedaAbierta(true)}
              aria-label="Buscar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:hidden"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={alternarTema}
              aria-label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {tema === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {inicialesDe(nombreUsuario)}
                </span>
                <span className="hidden flex-col items-start leading-tight md:flex">
                  <span className="max-w-32 truncate text-sm font-medium">{nombreUsuario ?? 'Usuario'}</span>
                  <span className="max-w-32 truncate text-xs text-muted-foreground">{nombreRol ?? ''}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card py-1 shadow-lg"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{nombreUsuario ?? 'Usuario'}</p>
                    <p className="truncate text-xs text-muted-foreground">{nombreRol ?? ''}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

       <main className="mx-auto w-full max-w-7xl min-w-0 p-4 sm:p-6 lg:p-8 dark:[&_h1]:text-sky-200">
          <Outlet />
        </main>
      </div>

      <GlobalSearchDialog open={isBusquedaAbierta} onClose={() => setIsBusquedaAbierta(false)} />
    </div>
  );
}