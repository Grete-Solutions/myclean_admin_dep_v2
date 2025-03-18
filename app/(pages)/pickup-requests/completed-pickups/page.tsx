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
import { ArrowUpDown, ChevronDown, MoreHorizontal, MapPin, Phone, Car, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Badge } from "@/components/ui/badge"

// Using the same Pickup type from the original component
type Pickup = {
  sorted: boolean;
  vehicleColor: string;
  vehicleMake: string;
  vehicleLicenseNumber: string;
  driverPhone: string;
  userPhone: string;
  isDelete: boolean;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  details: string;
  pickupLocation: {
    _latitude: number;
    _longitude: number;
  };
};

// Modified columns for Completed pickups with additional cancellation-specific info
const columns: ColumnDef<Pickup>[] = [
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
    accessorKey: "vehicleMake",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Vehicle
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Car className="h-4 w-4 mr-2" />
        <div>
          <span className="font-medium">{row.original.vehicleMake}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            <div 
              className="h-3 w-3 rounded-full mr-1" 
              style={{ backgroundColor: row.original.vehicleColor }}
            ></div>
            {row.original.vehicleColor}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "vehicleLicenseNumber",
    header: "License Number",
    cell: ({ row }) => <div>{row.original.vehicleLicenseNumber}</div>,
  },
  {
    accessorKey: "driverPhone",
    header: "Driver Phone",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Phone className="h-4 w-4 mr-2 text-gray-500" />
        {row.original.driverPhone}
      </div>
    ),
  },
  {
    accessorKey: "userPhone",
    header: "User Phone",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Phone className="h-4 w-4 mr-2 text-gray-500" />
        {row.original.userPhone}
      </div>
    ),
  },
  
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.details}>
        {row.original.details}
      </div>
    ),
  },
  {
    accessorKey: "pickupLocation",
    header: "Pickup Location",
    cell: ({ row }) => {
      const { _latitude, _longitude } = row.original.pickupLocation;
      return (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span>{_latitude.toFixed(4)}, {_longitude.toFixed(4)}</span>
        </div>
      );
    },
  },
{
    accessorKey: "status",
    header: "status",
    cell: () => (
      <Badge variant="destructive" className="flex items-center w-fit">
        <X className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pickup = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(pickup.vehicleLicenseNumber)}>
              Copy License Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View on map</DropdownMenuItem>
            <DropdownMenuItem>Contact driver</DropdownMenuItem>
            <DropdownMenuItem>Contact user</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-green-600">Restore pickup</DropdownMenuItem>
            {!pickup.isDelete && (
              <DropdownMenuItem className="text-red-600">Delete pickup</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function CompletedPickupsTable({ data }: { data: Pickup[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
          placeholder="Filter by license number..."
          value={(table.getColumn("vehicleLicenseNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("vehicleLicenseNumber")?.setFilterValue(event.target.value)
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
                  No Completed pickups found.
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

// Main component for Completed pickups page
export default function CompletedPickupsPage() {
  const [pickups, setPickups] = React.useState<Pickup[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCompletedPickups = async () => {
    try {
      const response = await fetch("/api/GET/pickups/completedPickups");
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      setPickups(data.data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {

    setLoading(false);
    
    fetchCompletedPickups();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Completed Pickups</h1>
        <Button variant="outline" className="flex items-center">
          <X className="mr-2 h-4 w-4" />
          Export Completed Pickups
        </Button>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && <CompletedPickupsTable data={pickups} />}
    </div>
  );
}