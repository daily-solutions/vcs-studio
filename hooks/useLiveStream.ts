import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from '@/states/params';
import { useToast } from '@/ui/useToast';
import {
  DailyEventObjectLiveStreamingError,
  DailyUpdateStreamingCustomLayoutConfig,
} from '@daily-co/daily-js';
import { useLiveStreaming } from '@daily-co/daily-react';
import { dequal } from 'dequal';

import { MeetingSessionState } from '@/types/meetingSessionState';
import { useIsOwner } from '@/hooks/useIsOwner';
import { useMeetingSessionState } from '@/hooks/useMeetingSessionState';
import { useStage } from '@/hooks/useStage';

export const useLiveStream = () => {
  const { toast } = useToast();
  const isOwner = useIsOwner();
  const {
    layout,
    isLiveStreaming,
    stopLiveStreaming: dailyStopLiveStreaming,
    startLiveStreaming: dailyStartLiveStreaming,
    updateLiveStreaming,
  } = useLiveStreaming({
    onLiveStreamingError: useCallback(
      (ev: DailyEventObjectLiveStreamingError) => {
        toast({
          title: 'Live-streaming failed',
          description: ev.errorMsg,
          variant: 'destructive',
        });
      },
      [toast],
    ),
  });

  const [params] = useParams();
  const [{ assets, rtmps }] = useMeetingSessionState<MeetingSessionState>();

  const { participantIds } = useStage();

  const startLiveStreaming = useCallback(() => {
    const rtmpURLs = Object.values(rtmps)
      .filter((rtmp) => rtmp.active)
      .map((rtmp) => rtmp.streamURL + rtmp.streamKey);
    const session_assets = Object.values(assets ?? {}).reduce(
      (acc: { [key: string]: string }, asset) => {
        acc[`images/${asset.name}`] = asset.url;
        return acc;
      },
      {},
    );

    const viewport = params?.['custom.viewport'];
    const { width, height } =
      viewport === 'portrait'
        ? { width: 720, height: 1280 }
        : { width: 1280, height: 720 };

    dailyStartLiveStreaming({
      instanceId: '40000000-4000-4000-8000-800000000000',
      rtmpUrl: rtmpURLs,
      width,
      height,
      layout: {
        preset: 'custom',
        composition_params: params,
        session_assets,
        participants: {
          video: participantIds,
          audio: participantIds,
          sort: 'active',
        },
      },
    });
    toast({
      title: 'Starting live-stream',
      description: 'Your stream will be started in a few seconds',
    });
  }, [assets, dailyStartLiveStreaming, params, participantIds, rtmps, toast]);

  useEffect(() => {
    if (!isLiveStreaming || !isOwner) return;

    const areParamsEqual = dequal(
      (layout as DailyUpdateStreamingCustomLayoutConfig).composition_params,
      params,
    );

    const preset = layout?.preset;
    const layoutParticipants =
      preset === 'single-participant'
        ? [layout?.session_id]
        : layout?.participants;
    const areParticipantsEqual = dequal(layoutParticipants, participantIds);

    if (areParamsEqual && areParticipantsEqual) return;

    updateLiveStreaming({
      instanceId: '40000000-4000-4000-8000-800000000000',
      layout: {
        preset: 'custom',
        composition_params: params,
        participants: {
          video: participantIds,
          audio: participantIds,
          sort: 'active',
        },
      },
    });
  }, [
    params,
    isLiveStreaming,
    layout,
    updateLiveStreaming,
    participantIds,
    isOwner,
  ]);

  const stopLiveStreaming = useCallback(
    () =>
      dailyStopLiveStreaming({
        instanceId: '40000000-4000-4000-8000-800000000000',
      }),
    [dailyStopLiveStreaming],
  );

  const enableBroadcast = useMemo(
    () => Object.values(rtmps ?? {}).some((rtmp) => rtmp.active),
    [rtmps],
  );

  return {
    enableBroadcast,
    isLiveStreaming,
    stopLiveStreaming,
    startLiveStreaming,
  };
};
