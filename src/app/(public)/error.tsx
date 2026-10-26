'use client';
import { ErrorView } from '@/components/site/ErrorView';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
