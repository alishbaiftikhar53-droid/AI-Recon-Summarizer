import { useEffect, useState } from 'react';

function readSegments(): string[] {
  return window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

export function useRoute(): string[] {
  const [segments, setSegments] = useState<string[]>(readSegments);

  useEffect(() => {
    const handleChange = () => setSegments(readSegments());
    window.addEventListener('hashchange', handleChange);
    return () => window.removeEventListener('hashchange', handleChange);
  }, []);

  return segments;
}

export function navigate(path: string): void {
  window.location.hash = path;
}
