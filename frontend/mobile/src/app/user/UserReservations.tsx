import UserReservationsView from '@/ui/views/user/UserReservationsView';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';

export default function ReservationsPage() {
  return (
    <ScreenLayout>
      <UserReservationsView />
    </ScreenLayout>
  );
}