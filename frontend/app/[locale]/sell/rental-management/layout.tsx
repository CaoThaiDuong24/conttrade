interface RentalManagementLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function RentalManagementLayout({ children, params }: RentalManagementLayoutProps) {
  return <>{children}</>
}
