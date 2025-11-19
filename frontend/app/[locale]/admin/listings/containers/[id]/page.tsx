import { redirect } from 'next/navigation';

export default function ContainerDetailPage() {
  // Redirect to main containers listing page
  redirect('/admin/listings/containers');
}
