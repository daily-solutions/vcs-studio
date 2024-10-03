'use client';

import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';

import { Loader } from '@/components/Loader';

interface DailyClientProps {
  roomName: string;
  token?: string;
  requiresToken?: boolean;
}

export function DailyClientProvider({
  roomName,
  children,
  token = '',
  requiresToken = false,
}: React.PropsWithChildren<DailyClientProps>) {
  const pathname = usePathname();
  const params = useSearchParams();

  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  useEffect(() => {
    const handleCreateCallObject = async () => {
      if (callObject || !roomName || (requiresToken && !token)) return;

      const role = pathname.split('/').pop();

      const url = `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}.daily.co/${roomName}`;
      let newCallObject: DailyCall | null = null;
      try {
        newCallObject = DailyIframe.createCallObject({
          url,
          token,
          strictMode: true,
          sendSettings: {
            video: role === 'producer' ? 'quality-optimized' : 'default-video',
          },
          dailyConfig: {
            useDevicePreferenceCookies: true,
          },
          subscribeToTracksAutomatically: false,
        });
      } catch {
        newCallObject = DailyIframe.getCallInstance() ?? null;
      }

      if (!newCallObject) return;
      setCallObject(newCallObject);
      // attach callObject to window
      (window as any)['callObject'] = newCallObject;
      await newCallObject.preAuth({ url, token });
    };

    handleCreateCallObject();
  }, [callObject, requiresToken, roomName, pathname, token]);

  useEffect(() => {
    if (!callObject) return;

    const isRobot = params.get('robot');
    if (isRobot) {
      const role = pathname.split('/').pop() as string;
      if (['producer', 'presenter'].includes(role)) {
        callObject.setUserData(
          role === 'producer' ? { onStage: true } : { acceptedToJoin: true },
        );
      }
      callObject.join();
    }
  }, [callObject, params, pathname]);

  if (!callObject) return <Loader />;

  return <DailyProvider callObject={callObject}>{children}</DailyProvider>;
}
