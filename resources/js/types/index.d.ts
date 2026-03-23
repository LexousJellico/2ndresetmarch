import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    roles?: string[];
    permissions?: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Service {
  id: number;
    service_type_id?: number | null;
    service_type?: string | null;
  name: string;
  description: string;
  uom: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ServiceTypeOption {
    id: number;
    name: string;
    created_at?: string;
}

export interface ServiceTypeEntity {
    id: number;
    name: string;
    created_at?: string;
}

export interface Booking {
    id: number;
    service_id: number | null;
    service_name?: string | null;
    company_name?: string | null;
    client_name: string;
    client_contact_number: string;
    client_email: string;
    survey_email?: string | null;
    survey_proof_image_url?: string | null;
    client_address: string;
    type_of_event: string;
    booking_date_from: string | null;
    booking_date_to: string | null;  
    number_of_guests: number;
    booking_status: 'pending' | 'confirmed' | 'cancelled' | 'declined' | 'completed';
    payment_status: 'unpaid' | 'partial' | 'paid' | 'owing';
    created_at: string;
    items?: BookingServiceLine[];
    payments?: BookingPayment[];
    totals?: {
        items_total: number | null;
        payments_total: number | null;
    }
}

export interface BookingServiceLine {
    id: number;
    service_id: number | null;
    service_name?: string | null;
    price: number;
    quantity: number;
    line_total: number;
}

export interface BookingPayment {
    id: number;
    status: 'pending' | 'completed' | 'failed' | 'declined' | 'refunded';
    payment_method: string;
    amount: number;
    transaction_reference?: string | null;
    payment_gateway?: string | null;
    remarks?: string | null;
    created_at: string;
}
