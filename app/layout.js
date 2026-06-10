export const metadata = {
  title: 'JJStudio',
  description: 'The official Webpage for JJStudio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}