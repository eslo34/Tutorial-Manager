// Types for work-log.mjs. The implementation is plain .mjs so the local MCP
// server (dependency-free, no TypeScript) can import the same code the Next app
// does instead of keeping a second copy.

export interface SessionLike {
  started_at: string | Date;
  ended_at: string | Date | null;
}

export interface WorkSummary<S extends SessionLike = SessionLike> {
  total_sec: number;
  running: S | null;
  sessions: number;
  days_worked: number;
  first_worked_at: string | null;
  last_worked_at: string | null;
}

export declare function normalizeNotes(value: unknown): string | null;
export declare function secondsOf(session: SessionLike, now?: number): number;
export declare function summarize<S extends SessionLike>(sessions: S[], now?: number): WorkSummary<S>;
export declare function fmtDuration(sec: number): string;
export declare function fmtClock(sec: number): string;

export interface ReportVideo {
  id: string;
  title: string;
  client: string | null;
  client_id: string;
  status: string;
  video_type: string | null;
  source_type: string;
  created_at: Date;
  total_min: number;
  total_hours: number;
  sessions: number;
  days_worked: number;
  first_worked_at: string | null;
  last_worked_at: string | null;
  timer_running: boolean;
  notes: string | null;
  session_list?: { started_at: Date; ended_at: Date | null; min: number }[];
}

export interface WorkReport {
  generated_at: string;
  how_to_read: string;
  totals: {
    videos: number;
    tracked_videos: number;
    total_min: number;
    total_hours: number;
    avg_min_per_tracked_video: number | null;
  };
  clients: {
    id: string;
    name: string | null;
    company: string | null;
    videos: number;
    tracked_videos: number;
    total_min: number;
    total_hours: number;
  }[];
  videos: ReportVideo[];
}

// `prisma` is the generated client; typed loosely so this file stays free of the
// generated types (the MCP server imports the .mjs without them).
export declare function buildReport(
  prisma: unknown,
  opts?: { userId?: string; client?: string; includeSessions?: boolean }
): Promise<WorkReport>;
