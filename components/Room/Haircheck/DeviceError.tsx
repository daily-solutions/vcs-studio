import {
  DESKTOP_ASPECT_RATIO,
  MOBILE_ASPECT_RATIO,
} from '@/constants/aspectRatio';
import { AspectRatio } from '@/ui/AspectRatio';
import { useDevices } from '@daily-co/daily-react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { DeviceBlocked } from '@/components/Room/Haircheck/DeviceBlocked';
import { DevicePending } from '@/components/Room/Haircheck/DevicePending';

export function DeviceError() {
  const isMobile = useIsMobile();
  const { camState, micState } = useDevices();

  const isPending = camState === 'pending' || micState === 'pending';
  const isBlocked = camState === 'blocked' || micState === 'blocked';

  return (
    <AspectRatio
      ratio={isMobile ? MOBILE_ASPECT_RATIO : DESKTOP_ASPECT_RATIO}
      className="bg-muted"
    >
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        {isPending && <DevicePending />}
        {isBlocked && <DeviceBlocked />}
      </div>
    </AspectRatio>
  );
}
