import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Link } from '@inertiajs/react';
import {
  LayoutGrid,
  ClipboardList,
  Tags,
  CalendarDays,
  Users,
  Calendar,
} from 'lucide-react';
import bookings from '@/routes/bookings';
import users from '@/routes/users';
import AppLogo from './app-logo';

const services = {
  index: () => '/services',         
};

const serviceTypes = {
  index: () => '/service-types',   
};

const mainNavItems: NavItem[] = [
  {
    title: 'Calendar',
    href: dashboard(),
    icon: Calendar,
    permission: 'dashboard.view',
  },
  {
    title: 'Bookings',
    href: bookings.index(),
    icon: CalendarDays,
    permission: 'bookings.view',
  },
  {
    title: 'Services',
    href: services.index(),
    icon: ClipboardList,
    permission: 'services.manage',
  },
  {
    title: 'Service Types',
    href: serviceTypes.index(),
    icon: Tags,
    permission: 'service_types.manage',
  },
  {
    title: 'Users',
    href: users.index(),
    icon: Users,
    permission: 'users.manage',
  },
];


export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
