interface MyRentalsLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function MyRentalsLayout({ children }: MyRentalsLayoutProps) {
  // Just render children without any wrapper
  // The sidebar menu already handles navigation between active/history
  return <>{children}</>
}
