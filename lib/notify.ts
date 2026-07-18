// Best-effort phone push via ntfy.sh. The user subscribes one obscure topic name (NTFY_TOPIC) in the
// ntfy app; the cloud just POSTs to https://ntfy.sh/<topic>. Never throws — a failed push must never
// break the pipeline. Keep Title ASCII (ntfy header rule); put emoji in the UTF-8 body or in tags.
export async function notify(
  message: string,
  opts: { title?: string; priority?: 'min' | 'low' | 'default' | 'high' | 'urgent'; tags?: string[]; click?: string } = {}
): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    const headers: Record<string, string> = {};
    if (opts.title) headers['Title'] = opts.title.replace(/[^\x20-\x7E]/g, '').slice(0, 120);
    if (opts.priority) headers['Priority'] = opts.priority;
    if (opts.tags?.length) headers['Tags'] = opts.tags.join(',');
    if (opts.click) headers['Click'] = opts.click;
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, { method: 'POST', headers, body: message });
  } catch (e) {
    console.error('ntfy notify failed (non-fatal):', e);
  }
}
