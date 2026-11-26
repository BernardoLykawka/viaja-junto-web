/** Modelos internos do app. A API ainda fala português (issue #39); a tradução fica em lib/adapters.ts. */
export type TripStatus = 'PLANNING' | 'CONFIRMED' | 'COMPLETED';
export type Role = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Member {
  id: number;
  user: User;
  role: Role;
}

export interface Trip {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  inviteCode: string | null;
  myRole: Role;
  owner: User;
  members: Member[];
  budgetTotal: number | null;
  plannedTotal: number;
}

export interface Place {
  id: number;
  name: string;
  country: string;
  isoCode: string | null;
  city: string | null;
  description: string | null;
  category: string | null;
  photoUrl: string | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface TripDestination {
  id: number;
  catalogId: number | null;
  name: string;
  country: string | null;
  isoCode: string | null;
  photoUrl: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  order: number | null;
}

export interface Activity {
  id: number;
  destinationId: number;
  catalogId: number | null;
  photoUrl: string | null;
  description: string | null;
  name: string;
  type: string | null;
  place: string | null;
  dateTime: string | null;
  durationMinutes: number | null;
  estimatedCost: number | null;
}

export interface BudgetCategory {
  category: string;
  total: number;
  percent: number;
}

export interface Budget {
  total: number | null;
  planned: number;
  available: number | null;
  percentConsumed: number;
  byCategory: BudgetCategory[];
}

export interface Page<T> {
  data: T[];
  totalItems: number;
  /** Há mais páginas depois desta. */
  hasMore: boolean;
}

export interface Review {
  id: string;
  author: User;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CatalogActivity {
  id: number;
  name: string;
  type: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  photoUrl: string | null;
  averagePrice: number | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface MapMarker {
  type: 'destination' | 'activity';
  id: string;
  label: string;
  lat: number;
  lng: number;
}
