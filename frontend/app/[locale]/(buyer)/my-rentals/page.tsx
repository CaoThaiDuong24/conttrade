import { redirect } from '@/i18n/routing'

export default function MyRentalsPage() {
  // Redirect to active rentals as the default page
  redirect({ href: '/my-rentals/active', locale: 'vi' })
}
