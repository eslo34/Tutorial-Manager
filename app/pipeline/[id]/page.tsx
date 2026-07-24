import { redirect } from 'next/navigation';

// Old per-video board URL — the merged video page lives at /video/[id] now.
export default function PipelineVideoRedirect({ params }: { params: { id: string } }) {
  redirect(`/video/${params.id}`);
}
