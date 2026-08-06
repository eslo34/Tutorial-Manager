// Types for video-list.mjs. The implementation is plain .mjs so the local MCP
// server (dependency-free, no TypeScript) can import the same code the Next app
// does instead of keeping a second copy.

export interface VideoListItem {
  code: string;
  title: string;
  meta: string;
  note: string;
  done: boolean;
}

export interface VideoListGroup {
  name: string;
  note: string;
  items: VideoListItem[];
}

export interface VideoList {
  source?: string;
  updatedAt?: string;
  groups: VideoListGroup[];
}

export declare const MAX_GROUPS: number;
export declare const MAX_ITEMS: number;

export declare function normalizeList(input: unknown): {
  source: string;
  groups: VideoListGroup[];
  truncated: boolean;
};

export declare function keyOf(item: { code?: string; title?: string }): string;

export declare function mergeTicks(
  incomingGroups: VideoListGroup[],
  previous: VideoList | null | undefined
): { groups: VideoListGroup[]; kept: number; added: number; removed: number };

export declare function listStats(list: VideoList | null | undefined): {
  groups: number;
  items: number;
  done: number;
};
