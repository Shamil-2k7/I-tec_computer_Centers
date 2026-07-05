/**
 * Extracts a YouTube video ID from any common URL format and
 * returns both the canonical watch URL and the embeddable URL.
 * Supports:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
};

export const toEmbedUrl = (url: string): string | null => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
};

export const toThumbnailUrl = (url: string): string | null => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeId(url) !== null;
};
