'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SyncCommentsButtonProps {
  featureId: string;
}

export function SyncCommentsButton({ featureId }: SyncCommentsButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/features/${featureId}/sync-comments`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync comments');
      }

      setMessage({
        type: 'success',
        text: `✓ Synced ${data.synced} new comment${data.synced !== 1 ? 's' : ''}, skipped ${data.skipped}`,
      });

      // Refresh the page to show new comments
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync comments',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Comments
          </>
        )}
      </Button>
      {message && (
        <p
          className={`text-xs ${
            message.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
