import type { LucideIcon } from 'lucide-react';
import {
  Accessibility,
  Car,
  ShieldCheck,
  Wifi,
  Volume2,
  Lightbulb,
  AirVent,
  PlugZap,
  Trash2,
  MapPinned,
} from 'lucide-react';

export type Amenity = {
  label: string;
  icon: LucideIcon;
};

export const amenities: Amenity[] = [
  { label: 'Accessibility', icon: Accessibility },
  { label: 'Parking Area', icon: Car },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Wi-Fi Ready', icon: Wifi },
  { label: 'Audio Support', icon: Volume2 },
  { label: 'Lighting Setup', icon: Lightbulb },
  { label: 'Air Conditioned', icon: AirVent },
  { label: 'Power Access', icon: PlugZap },
  { label: 'Waste Disposal', icon: Trash2 },
  { label: 'Tourist Guidance', icon: MapPinned },
];