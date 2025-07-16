"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Edit, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import ServiceLocationsSheet from "./ServiceLocationsSheet"

type Coordinate = {
  _latitude: number;
  _longitude: number;
};

type Bin = {
  binType: string;
  capacity: number;
  price: number;
  equivalentBags: string;
  isActive: boolean;
  imageUrl: string;
};

type ServiceLocation = {
  id: string;
  city: string;
  price: number;
  isActive: boolean;
  countryISOCode: string;
  commission: number | null;
  coordinates?: Coordinate;
  bins?: Bin[];
  radius?: number;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
};

// Actions component for each row
function Actions({ 
  service, 
  onDelete, 
  onEdit 
}: { 
  service: ServiceLocation;
  onDelete: (id: string) => Promise<void>;
  onEdit: (service: ServiceLocation) => void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(service.id);
      toast.success("Service location deleted successfully");
    } catch {
      toast.error("Failed to delete service location");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(service)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service location for {service.city}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ServiceDataTable({ 
  data, 
  onDelete, 
  onEdit 
}: { 
  data: ServiceLocation[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (service: ServiceLocation) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<ServiceLocation>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => <div className="font-medium">{row.original.city}</div>,
    },
    {
      accessorKey: "countryISOCode",
      header: "Country",
      cell: ({ row }) => <div>{row.original.countryISOCode}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>${row.original.price.toFixed(2)}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div className={row.original.isActive ? "text-green-500" : "text-red-500"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      accessorKey: "commission",
      header: "Commission",
      cell: ({ row }) => (
        <div>
          {row.original.commission !== null ? `${row.original.commission}%` : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "coordinates",
      header: "Coordinates",
      cell: ({ row }) => {
        const coordinates = row.original.coordinates;
        return (
          <div>
            {coordinates && coordinates._latitude != null && coordinates._longitude != null
              ? `${coordinates._latitude.toFixed(4)}, ${coordinates._longitude.toFixed(4)}`
              : "No coordinates"}
          </div>
        );
      },
    },
    {
      accessorKey: "radius",
      header: "Radius",
      cell: ({ row }) => (
        <div>
          {row.original.radius ? `${row.original.radius} km` : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "bins",
      header: "Bins",
      cell: ({ row }) => (
        <div>
          {row.original.bins ? `${row.original.bins.length} bins` : "No bins"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Actions 
          service={row.original} 
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by city..."
          value={(table.getColumn("city")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("city")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Example page component that uses the ServiceDataTable
export default function ServicePage() {
  const [services, setServices] = React.useState<ServiceLocation[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/GET/locations/locations");
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      setServices(data.data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id: string) => {
    const response = await fetch(`/api/DELETE/serviceLocation?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete service location: ${response.status}`);
    }

    const result = await response.json();
    console.log('Delete success:', result);

    // Refresh the services list after successful deletion
    setServices(prevServices => prevServices.filter(service => service.id !== id));
  };

  const handleEdit = (service: ServiceLocation) => {
    // You can implement your edit logic here
    // For example, open a modal or navigate to an edit page
    console.log('Edit service:', service);
    
    // Example: You might want to open a modal or navigate to an edit page
    // For now, we'll just log the service to be edited
    // You can replace this with your actual edit implementation
  };
  
  React.useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <ServiceLocationsSheet/>
      <div className="flex items-center justify-between">
      </div>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && (
        <ServiceDataTable 
          data={services} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}