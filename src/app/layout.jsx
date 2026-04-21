import './globals.css'

export const metadata = {
  title: 'HomeLink — Plataforma de Liquidez Imobiliária',
  description: 'Conectando compradores e vendedores em cadeias de transação otimizadas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
