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
import {  ChevronDown, MoreHorizontal } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


type UserData = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  userType: number;
  email: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  deactivated: number;
  suspended: number;
  status: string;
  action: React.ReactNode;
};

type UserDetails = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  userType: number;
  email: string;
  country: string;
  city: string;
  isDelete: boolean;
  isDisable: boolean;
  isSuspend: boolean;
  referral: string;
  referredBy: string;
  pickup_address: string;
  profilePicture: string;
  pickup_location: {
    _latitude: number;
    _longitude: number;
  };
  fcmToken: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  // Add more fields as needed
};

type PickupData = {
  id: string;
  userId: string;
  status: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  // Add more fields
};

type PaymentData = {
  id: string;
  userId: string;
  reference: string;
  amount: string;
  status: string;
  customermsisdn: string;
  channel: string;
  paymentMethod: string;
  desc: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  // Add more fields
};

function UsersDataTable({ data, onViewDetails }: { data: UserData[], onViewDetails: (userId: string) => void }) {
  const columns: ColumnDef<UserData>[] = [
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
    accessorKey: "firstname",
    header: "First Name",
    cell: ({ row }) => <div className="font-medium">{row.original.firstname}</div>,
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
    cell: ({ row }) => <div>{row.original.lastname}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.original.phone}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "userType",
    header: "User Type",
    cell: ({ row }) => <div>{row.original.userType}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={row.original.status === "active" ? "text-green-500" : "text-red-500"}>
        {row.original.status}
      </div>
    ),
  },
  {
    accessorKey: "deactivated",
    header: "Deactivated",
    cell: ({ row }) => (
      <div className={row.original.deactivated ? "text-red-500" : "text-green-500"}>
        {row.original.deactivated ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "suspended",
    header: "Suspended",
    cell: ({ row }) => (
      <div className={row.original.suspended ? "text-red-500" : "text-green-500"}>
        {row.original.suspended ? "Yes" : "No"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(data.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(data.id)}>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

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
          placeholder="Filter by firstName..."
          value={(table.getColumn("firstname")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstname")?.setFilterValue(event.target.value)
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

// Example page component that uses the UserDatasDataTable
export default function UserDatasPage() {
  const [UserDatas, setUserDatas] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [userDetails, setUserDetails] = React.useState<UserDetails | null>(null);
  const [userPickups, setUserPickups] = React.useState<PickupData[]>([]);
  const [userPayments, setUserPayments] = React.useState<PaymentData[]>([]);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

    const fetchBeans = async () => {
      try {
        const response = await fetch("/api/GET/user-management/approvedUsers");
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setUserDatas(data.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };  React.useEffect(() => {


    fetchBeans();
  }, []);

  const handleViewDetails = async (userId: string) => {
    setDialogOpen(true);
    setDetailsLoading(true);

    try {
      // Fetch comprehensive user details
      const response = await fetch(`/api/GET/user-management/userDetails?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setUserDetails(data.data.user);
        setUserPickups(data.data.pickups);
        setUserPayments(data.data.payments);
      } else {
        console.error('Failed to fetch user details:', data.error);
      }

    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">




      </div>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && <UsersDataTable data={UserDatas} onViewDetails={handleViewDetails} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <p>{userDetails.firstname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <p>{userDetails.lastname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p>{userDetails.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p>{userDetails.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <p>{userDetails.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <p>{userDetails.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User Type</label>
                    <p>{userDetails.userType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Referral Code</label>
                    <p>{userDetails.referral}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pickup Address</label>
                    <p>{userDetails.pickup_address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Disabled</label>
                    <p>{userDetails.isDisable ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Suspended</label>
                    <p>{userDetails.isSuspend ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deleted</label>
                    <p>{userDetails.isDelete ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Pickups */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Pickup Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPickups.length > 0 ? (
                    <div className="space-y-2">
                      {userPickups.slice(0, 5).map((pickup) => (
                        <div key={pickup.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">Pickup #{pickup.id}</p>
                            <p className="text-sm text-gray-500">Status: {pickup.status}</p>
                          </div>
                          <Badge variant="outline">{pickup.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No pickup requests found</p>
                  )}
                </CardContent>
              </Card>

              {/* Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPayments.length > 0 ? (
                    <div className="space-y-2">
                      {userPayments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">Payment {payment.reference}</p>
                            <p className="text-sm text-gray-500">Amount: ${payment.amount}</p>
                            <p className="text-sm text-gray-500">Method: {payment.paymentMethod} ({payment.channel})</p>
                          </div>
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No payment history found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p>Failed to load user details</p>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}