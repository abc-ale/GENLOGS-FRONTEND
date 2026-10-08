
interface PlaceholderProps {
  nombre: string
}

export function Placeholder({ nombre }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-border p-8 text-center">
      <div className="text-6xl mb-4">📄</div>
      <h2 className="text-xl font-semibold mb-2">{nombre}</h2>
      <p className="text-muted-foreground">Módulo en desarrollo</p>
    </div>
  )
}