import AppLayout from '@/layouts/app-layout';
import { Service, type BreadcrumbItem, type ServiceTypeOption } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import ServiceFormModal from './ServiceFormModal';
import DeleteServiceDialog from './DeleteServiceDialog';
import servicesRoutes from '@/routes/services';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: servicesRoutes.index.url(),
    },
];

interface LaravelPaginationLink {
  url: string | null;
  label: string;
  page: number;
  active: boolean;
}

interface ServicesPageProps {
  services: {
    data: Service[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: LaravelPaginationLink[];
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
  };
    serviceTypes: ServiceTypeOption[];
}

export default function Services({ services, serviceTypes }: ServicesPageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [selected, setSelected] = useState<Service | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    function openCreate() {
        setSelected(null);
        setMode('create');
        setModalOpen(true);
    }

    function openEdit(service: Service) {
        setSelected(service);
        setMode('edit');
        setModalOpen(true);
    }

    function openDelete(service: Service) {
        setSelected(service);
        setDeleteOpen(true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle>Services</CardTitle>
                    <Button onClick={openCreate} size="sm">New Service</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of services offered.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>UoM</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.data.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.service_type ?? '-'}</TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>{service.uom}</TableCell>
                                    <TableCell className="text-right">{Number(service.price).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openEdit(service)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => openDelete(service)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination>
                        <PaginationContent>
                                {services.meta.links.map((link, i) => (
                                    <PaginationItem key={i}>
                                    {link.label.includes("Previous") ? (
                                        <PaginationPrevious key={i} href={link.url ?? "#"} aria-disabled={!link.url} tabIndex={link.url ? 0 : -1}>
                                        {/* <Link > */}
                                            Previous
                                        {/* </Link> */}
                                        </PaginationPrevious>
                                    ) : link.label.includes("Next") ? (
                                        <PaginationNext key={i} href={link.url ?? "#"} aria-disabled={!link.url} tabIndex={link.url ? 0 : -1}>
                                        {/* <Link > */}
                                            Next
                                        {/* </Link> */}
                                        </PaginationNext>
                                    ) : link.label === "..." ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink key={i} isActive={link.active} href={link.url ?? "#"} aria-current={link.active ? "page" : undefined}>
                                            {/* <Link href={link.url ?? "#"}> */}
                                                {link.label}
                                            {/* </Link> */}
                                        </PaginationLink>
                                    )}
                                    </PaginationItem>
                                ))}
                                </PaginationContent>
                    </Pagination>
                </CardContent>
            </Card>
            </div>

            <ServiceFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={mode}
                service={selected}
                serviceTypes={serviceTypes}
            />

            <DeleteServiceDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                service={selected}
            />
        </AppLayout>
    );
}
