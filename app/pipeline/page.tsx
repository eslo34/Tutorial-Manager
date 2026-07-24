import { redirect } from 'next/navigation';

// The pipeline board and the dashboard are one app now — the clients overview at
// / is the board. Kept as a redirect because the phone push notifications sent by
// /api/pipeline/event link here.
export default function PipelineRedirect() {
  redirect('/');
}
