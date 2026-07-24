import { redirect } from 'next/navigation';

// Old per-client board URL — merged into /client/[clientId].
export default function PipelineClientRedirect({ params }: { params: { clientId: string } }) {
  redirect(`/client/${params.clientId}`);
}
