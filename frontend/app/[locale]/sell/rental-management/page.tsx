import { redirect } from 'next/navigation'

export default function RentalManagementPage({ params }: { params: { locale: string } }) {
  // Redirect to dashboard as the default page
  redirect(`/${params.locale}/sell/rental-management/dashboard`)
}
