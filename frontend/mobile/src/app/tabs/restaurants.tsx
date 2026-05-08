import RestaurantView from '@/ui/views/RestaurantView';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { AppLayout } from '@/ui/layouts/AppLayout';

export default function RestaurantsPage() {
  return (
    <ScreenLayout> 
      <RestaurantView />
    </ScreenLayout>
  );
}
