import React, { useState } from 'react';
import { useLocalSessionId, usePermissions } from '@daily-co/daily-react';

import { useIsOwner } from '@/hooks/useIsOwner';
import { useParticipants } from '@/hooks/useParticipants';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Participants } from '@/components/room/stage/Participants';
import { TabHeader } from '@/components/room/stage/TabHeader';
import { Tile } from '@/components/tile';

export function Stage() {
  const [tab, setTab] = useState('stage');

  const { participantIds, waitingParticipantIds } = useParticipants();

  const localSessionId = useLocalSessionId();
  const isOwner = useIsOwner();
  const { hasPresence } = usePermissions();

  if (!hasPresence) return null;

  if (!isOwner) {
    return (
      <div className="absolute bottom-28 left-8 w-[calc(9rem*(16/9))]">
        <Tile sessionId={localSessionId} noVideoTileColor="bg-background" />
      </div>
    );
  }

  return (
    <Tabs
      orientation="vertical"
      value={tab}
      onValueChange={setTab}
      className="border-t bg-muted px-2"
    >
      <div className="min-h-40 h-40 w-full">
        <div className="flex h-full items-center gap-4">
          <TabsList className="flex flex-col gap-2">
            <TabHeader
              name="Stage"
              value="stage"
              count={participantIds.length}
              active={tab === 'stage'}
            />
            <TabHeader
              name="Waiting"
              value="waiting"
              count={waitingParticipantIds.length}
              active={tab === 'waiting'}
            />
          </TabsList>
          <div className="h-full flex-1">
            <TabsContent value="stage">
              <Participants participantIds={participantIds} />
            </TabsContent>
            <TabsContent value="waiting">
              <Participants participantIds={waitingParticipantIds} />
            </TabsContent>
          </div>
        </div>
      </div>
    </Tabs>
  );
}
