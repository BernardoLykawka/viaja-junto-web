import { dateRange } from '../lib/format';
import { useTripDestinations } from '../lib/queries';
import type { Trip } from '../lib/types';
import { tripPeople } from '../lib/members';
import { PhotoCard, TravelersPill } from './PhotoCard';
import { StatusBadge } from './ui';

/** Card de foto de uma viagem: a foto vem do primeiro destino do roteiro que tiver uma. */
export function TripCard({ trip }: { trip: Trip }) {
  const dest = useTripDestinations(trip.id);
  const photo = dest.data?.find((d) => d.photoUrl)?.photoUrl ?? null;
  return (
    <PhotoCard
      to={`/viagens/${trip.id}`}
      photoUrl={photo}
      alt={`Foto de ${trip.name}`}
      title={trip.name}
      subtitle={dateRange(trip.startDate, trip.endDate)}
      badge={<StatusBadge status={trip.status} />}
      corner={<TravelersPill count={tripPeople(trip).length} />}
    />
  );
}
