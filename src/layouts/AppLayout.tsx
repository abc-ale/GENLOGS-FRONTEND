import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cotizaciones', path: '/cotizaciones', icon: FileText },
  { label: 'Órdenes de compra', path: '/ordenes-compra', icon: ShoppingCart },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Proveedores', path: '/proveedores', icon: Truck },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Facturación', path: '/facturacion', icon: Receipt },
  { label: 'Empresas mineras', path: '/empresas-mineras', icon: Building2 },
  { label: 'Reportes', path: '/reportes', icon: BarChart3 },
  { label: 'Usuarios', path: '/usuarios', icon: UserCog },
];

const catalogoSubItems: NavItem[] = [
  { label: 'Repuestos', path: '/catalogo-repuestos', icon: Package },
  { label: 'Servicios', path: '/catalogo-servicios', icon: Package },
];

// Los 4 accesos más usados van fijos en la barra inferior móvil; el resto
// (Proveedores, Catálogo, Facturación, Empresas mineras, Reportes, Usuarios)
// vive detrás del quinto botón, "Menú".
const bottomNavItems: NavItem[] = mainNavItems.slice(0, 4);

/** Clase única para todo item de navegación activo/inactivo — nunca se
 *  redefine por pantalla, para que el estado "seleccionado" se vea y se
 *  comporte igual en el drawer móvil, el nav de escritorio y el dropdown. */
function navLinkClass(isActive: boolean, dense = false) {
  const base = `flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    dense ? 'px-3 py-1.5' : 'px-3 py-2'
  }`;
  return isActive
    ? `${base} bg-accent/10 text-accent font-semibold`
    : `${base} text-muted-foreground hover:bg-muted hover:text-foreground`;
}

/** Estilo del nav horizontal del header (escritorio) — sin caja de fondo,
 *  solo cambio de color + una línea delgada debajo cuando está activo.
 *  Más liviano y "Instagram/minimalista" que una píldora rellena. */
function topNavLinkClass(isActive: boolean) {
  return `relative flex h-full items-center px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${
    isActive ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'
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
  const [isMobileCatalogoOpen, setIsMobileCatalogoOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBusquedaAbierta, setIsBusquedaAbierta] = useState(false);
  const catalogoRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const nombreUsuario = useAuthStore((s) => s.nombreUsuario);
  const nombreRol = useAuthStore((s) => s.nombreRol);
  const logout = useAuthStore((s) => s.logout);
  const { tema, alternarTema } = useTheme();

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  const isCatalogoActive =
    location.pathname.startsWith('/catalogo-repuestos') ||
    location.pathname.startsWith('/catalogo-servicios');

  // El "Menú" de la barra inferior cuenta como activo cuando estamos en algo
  // que no vive en los 4 accesos fijos (para que siempre haya un ítem resaltado).
  const isMenuSectionActive =
    !bottomNavItems.some((item) => location.pathname.startsWith(item.path)) &&
    !location.pathname.startsWith('/dashboard');

  // El dropdown de Catálogo y el menú de usuario se abren/cierran con click
  // (no solo hover), para que funcionen igual con mouse, teclado y táctil.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catalogoRef.current && !catalogoRef.current.contains(e.target as Node)) {
        setIsCatalogoOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bloquea el scroll del body mientras el drawer móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Ctrl+K / Cmd+K abre la búsqueda global desde cualquier pantalla.
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
    // Limpia las dos fuentes de sesión (localStorage que lee axios/ProtectedRoute,
    // y el store de Zustand persistido en sessionStorage) para no dejar rastro.
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    logout();
    setIsUserMenuOpen(false);
    closeMenu();
    navigate('/login', { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col font-sans antialiased text-foreground overflow-x-hidden">
      {/* Fondo ilustrado — un par de manchas de color muy suaves y
          desenfocadas, fijas detrás de todo el contenido. Dan un aire
          "premium/orgánico" sin romper el minimalismo ni tapar nada:
          opacidad muy baja, no interactúan con el mouse. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-success/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-warning/15 blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Navbar superior — vidrio esmerilado (glassmorphism): fondo
          semitransparente + blur fuerte, borde muy sutil en vez de línea
          dura, para que se sienta ligera y flote sobre el contenido. */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            {/* width/height fijan la proporción real (1920x800) para que el
                navegador reserve el espacio antes de que cargue la imagen
                y no "salte" el resto del header al montar la página. */}
            <img
              src={logoGenlogs}
              alt="GenLogs"
              width={192}
              height={80}
              className="h-9 w-auto max-w-[9rem] object-contain shrink-0"
            />
            <span className="hidden text-lg font-semibold tracking-tight text-foreground truncate sm:inline">
              ERP
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Navegación de escritorio — desde lg (1024px) para evitar que
                los ~7 items se aprieten en tablets (md, 768-1024px) */}
            <nav className="hidden lg:flex items-stretch gap-5 h-16">
              {mainNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link key={item.path} to={item.path} className={topNavLinkClass(isActive)}>
                    {item.label}
                    {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
                  </Link>
                );
              })}

              {/* Dropdown de Catálogo — click, no hover, para funcionar en táctil */}
              <div className="relative flex items-stretch" ref={catalogoRef}>
                <button
                  onClick={() => setIsCatalogoOpen((v) => !v)}
                  aria-expanded={isCatalogoOpen}
                  aria-haspopup="menu"
                  className={`${topNavLinkClass(isCatalogoActive)} gap-1`}
                >
                  <span>Catálogo</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCatalogoOpen ? 'rotate-180' : ''}`} />
                  {isCatalogoActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
                </button>
                {isCatalogoOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl py-1.5 shadow-lg shadow-black/5 z-50"
                  >
                    {catalogoSubItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        role="menuitem"
                        onClick={() => setIsCatalogoOpen(false)}
                        className={navLinkClass(location.pathname.startsWith(subItem.path))}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Búsqueda global — Ctrl+K / Cmd+K desde cualquier pantalla */}
            <button
              type="button"
              onClick={() => setIsBusquedaAbierta(true)}
              aria-label="Buscar (Ctrl+K)"
              className="flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden text-xs text-muted-foreground xl:inline">Ctrl+K</span>
            </button>

            {/* Alternar tema claro/oscuro — visible en todos los tamaños */}
            <button
              type="button"
              onClick={alternarTema}
              aria-label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              {tema === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Menú de usuario — visible en todos los tamaños, es la única
                forma de cerrar sesión en toda la app. */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {inicialesDe(nombreUsuario)}
                </span>
                <span className="hidden xl:flex flex-col items-start leading-tight max-w-32">
                  <span className="text-sm font-medium text-foreground truncate w-full text-left">
                    {nombreUsuario ?? 'Usuario'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {nombreRol ?? ''}
                  </span>
                </span>
                <ChevronDown className={`hidden sm:block w-4 h-4 text-muted-foreground transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl py-1 shadow-lg shadow-black/5 z-50"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground truncate">{nombreUsuario ?? 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground truncate">{nombreRol ?? ''}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Drawer "Menú" — en móvil se abre desde la barra inferior en vez
            de un hamburguesa arriba, y reúne todo lo que no cabe en los
            4 accesos fijos de abajo. */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden"
              onClick={closeMenu}
              aria-hidden="true"
            />

            <aside
              className="fixed top-0 left-0 w-[85vw] max-w-72 h-full bg-card/85 backdrop-blur-xl border-r border-border/60 text-card-foreground z-50 shadow-2xl shadow-black/10 flex flex-col justify-between overflow-y-auto lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de módulos"
            >
              <div>
                <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
                  <span className="text-base font-semibold text-foreground">Menú de módulos</span>
                  <button
                    onClick={closeMenu}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tarjeta del usuario logueado, arriba del todo del menú */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {inicialesDe(nombreUsuario)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{nombreUsuario ?? 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground truncate">{nombreRol ?? ''}</p>
                  </div>
                </div>

                <nav className="space-y-1 p-5">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={navLinkClass(location.pathname.startsWith(item.path))}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ))}

                  {/* Catálogo como acordeón */}
                  <div>
                    <button
                      onClick={() => setIsMobileCatalogoOpen((v) => !v)}
                      aria-expanded={isMobileCatalogoOpen}
                      className={`w-full flex items-center justify-between ${navLinkClass(isCatalogoActive)}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="h-4 w-4 shrink-0" />
                        Catálogo
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isMobileCatalogoOpen || isCatalogoActive ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {(isMobileCatalogoOpen || isCatalogoActive) && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
                        {catalogoSubItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={closeMenu}
                            className={navLinkClass(location.pathname.startsWith(subItem.path))}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={navLinkClass(location.pathname.startsWith(item.path))}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="border-t border-border p-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setIsBusquedaAbierta(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={alternarTema}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  {tema === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {tema === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
                <p className="text-xs text-muted-foreground text-center">GenLogs ERP System</p>
              </div>
            </aside>
          </>
        )}

        {/* Barra secundaria de escritorio (lg+): los módulos que no caben
            en el nav superior, siempre visibles sin abrir el drawer */}
        <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0 border-r border-border/60 bg-card/60 backdrop-blur-xl p-4">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={navLinkClass(location.pathname.startsWith(item.path))}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Contenido principal — más aire en escritorio, y espacio abajo en
            móvil para no quedar tapado por la barra de navegación inferior */}
        <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Barra de navegación inferior — solo móvil/tablet (hasta lg),
          estilo app: iconos fijos + "Menú" para todo lo demás. */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div className="grid grid-cols-5">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate max-w-[4.5rem]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
              isMenuOpen || isMenuSectionActive ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            <Menu className="h-5 w-5" strokeWidth={isMenuOpen || isMenuSectionActive ? 2.5 : 2} />
            <span>Menú</span>
          </button>
        </div>
      </nav>

      <GlobalSearchDialog open={isBusquedaAbierta} onClose={() => setIsBusquedaAbierta(false)} />
    </div>
  );
}
