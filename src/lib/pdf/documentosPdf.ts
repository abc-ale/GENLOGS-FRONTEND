import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoUrl from '@/assets/GENLOGS.png'

export interface LineaPdf {
  descripcion: string
  unidad?: string
  cantidad: number
  precioUnitario: number
  importe: number
}

export interface DocumentoPdf {
  titulo: string // COTIZACIÓN, ORDEN DE COMPRA, FACTURA
  numero: string
  datos: Array<[string, string]> // bloque de datos generales
  lineas: LineaPdf[]
  subtotal: number
  igv: number
  total: number
  moneda: string
  observaciones?: string | null
  nombreArchivo: string
}

const AZUL: [number, number, number] = [29, 78, 158]

let logoCache: Promise<string | null> | null = null
function cargarLogo(): Promise<string | null> {
  if (!logoCache) {
    logoCache = fetch(logoUrl)
      .then((r) => r.blob())
      .then(
        (b) =>
          new Promise<string | null>((res) => {
            const fr = new FileReader()
            fr.onload = () => res(fr.result as string)
            fr.onerror = () => res(null)
            fr.readAsDataURL(b)
          })
      )
      .catch(() => null)
  }
  return logoCache
}

function dinero(n: number, moneda: string) {
  const simbolo = moneda === 'USD' ? 'US$' : moneda === 'EUR' ? '€' : 'S/'
  return `${simbolo} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export async function generarPdf(doc: DocumentoPdf): Promise<void> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = pdf.internal.pageSize.getWidth()
  const margen = 14

  const logo = await cargarLogo()
  if (logo) pdf.addImage(logo, 'PNG', margen, 10, 46, 19.2)

  // Título y número a la derecha
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(...AZUL)
  pdf.text(doc.titulo, ancho - margen, 17, { align: 'right' })
  pdf.setFontSize(12)
  pdf.setTextColor(40)
  pdf.text(doc.numero, ancho - margen, 24, { align: 'right' })

  pdf.setDrawColor(...AZUL)
  pdf.setLineWidth(0.6)
  pdf.line(margen, 33, ancho - margen, 33)

  // Datos generales en dos columnas
  pdf.setFontSize(9.5)
  let y = 40
  const mitad = Math.ceil(doc.datos.length / 2)
  doc.datos.forEach(([k, v], i) => {
    const col = i < mitad ? 0 : 1
    const fila = i < mitad ? i : i - mitad
    const x = margen + col * ((ancho - margen * 2) / 2)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(90)
    pdf.text(`${k}:`, x, y + fila * 6)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(30)
    pdf.text(String(v || '—'), x + 30, y + fila * 6, { maxWidth: (ancho - margen * 2) / 2 - 32 })
  })
  y += mitad * 6 + 4

  autoTable(pdf, {
    startY: y,
    head: [['#', 'Descripción', 'Unid.', 'Cant.', 'P. unit.', 'Importe']],
    body: doc.lineas.map((l, i) => [
      String(i + 1),
      l.descripcion,
      l.unidad ?? '',
      l.cantidad.toLocaleString('es-PE'),
      dinero(l.precioUnitario, doc.moneda),
      dinero(l.importe, doc.moneda),
    ]),
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 18 },
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 32 },
    },
    margin: { left: margen, right: margen },
  })

  const lastY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  let yt = lastY + 8
  const xEtiqueta = ancho - margen - 70
  const fila = (etq: string, val: string, negrita = false) => {
    pdf.setFont('helvetica', negrita ? 'bold' : 'normal')
    pdf.setFontSize(negrita ? 11 : 10)
    pdf.setTextColor(negrita ? AZUL[0] : 50, negrita ? AZUL[1] : 50, negrita ? AZUL[2] : 50)
    pdf.text(etq, xEtiqueta, yt)
    pdf.text(val, ancho - margen, yt, { align: 'right' })
    yt += negrita ? 8 : 6
  }
  fila('Subtotal', dinero(doc.subtotal, doc.moneda))
  fila('IGV (18%)', dinero(doc.igv, doc.moneda))
  fila('TOTAL', dinero(doc.total, doc.moneda), true)

  if (doc.observaciones) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9.5)
    pdf.setTextColor(90)
    pdf.text('Observaciones:', margen, yt + 4)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(40)
    pdf.text(doc.observaciones, margen, yt + 10, { maxWidth: ancho - margen * 2 })
  }

  // Pie
  const alto = pdf.internal.pageSize.getHeight()
  pdf.setFontSize(8)
  pdf.setTextColor(130)
  pdf.text('GENLOGS S.A.C. · General Logistic Solutions S.A.C.', ancho / 2, alto - 10, { align: 'center' })

  pdf.save(doc.nombreArchivo)
}