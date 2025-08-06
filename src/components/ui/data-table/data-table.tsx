import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  TableState,
  VisibilityState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  GroupingState,
  PaginationState,
  TableMeta,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Extend the Row type to include our custom properties
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

// Define a more specific type for our table state to avoid type errors
interface CustomTableState extends Partial<TableState> {
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  columnVisibility?: VisibilityState
  rowSelection?: RowSelectionState
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey: string
  isLoading?: boolean
  onRowSelectionChange?: (value: Record<string, boolean>) => void
  rowSelection?: Record<string, boolean>
  state?: CustomTableState
  onStateChange?: (state: CustomTableState) => void
  meta?: TableMeta<TData>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  isLoading = false,
  onRowSelectionChange,
  rowSelection = {},
  state: propState = {},
  onStateChange,
  meta,
}: DataTableProps<TData, TValue>) {
  // Initialize state with default values
  const [sorting, setSorting] = React.useState<SortingState>(propState.sorting || [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(propState.columnFilters || [])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(propState.columnVisibility || {})
  const [rowSelectionState, setRowSelectionState] = React.useState<RowSelectionState>(rowSelection || {})
  
  // Memoize the state to avoid unnecessary re-renders
  const tableState = React.useMemo(() => ({
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection: rowSelectionState,
    // Add required TableState properties with default values
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    rowPinning: { top: [], bottom: [] },
    globalFilter: undefined,
    columnSizing: {},
    columnSizingInfo: {
      startOffset: 0,
      startSize: 0,
      deltaOffset: 0,
      deltaPercentage: 0,
      isResizingColumn: false as const,
      columnSizingStart: []
    },
    expanded: {},
    grouping: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  }), [sorting, columnFilters, columnVisibility, rowSelectionState])

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    meta,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelectionState) : updater
      setRowSelectionState(newSelection)
      onRowSelectionChange?.(newSelection)
      
      // Notify parent of state change if handler is provided
      onStateChange?.({
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection: newSelection,
      })
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      onStateChange?.({
        sorting: newSorting,
        columnFilters,
        columnVisibility,
        rowSelection: rowSelectionState,
      })
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      onStateChange?.({
        sorting,
        columnFilters: newFilters,
        columnVisibility,
        rowSelection: rowSelectionState,
      })
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater
      setColumnVisibility(newVisibility)
      onStateChange?.({
        sorting,
        columnFilters,
        columnVisibility: newVisibility,
        rowSelection: rowSelectionState,
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Sync row selection with props
  React.useEffect(() => {
    setRowSelectionState(rowSelection)
  }, [rowSelection])
  
  // Sync state from props
  React.useEffect(() => {
    if (propState.sorting) setSorting(propState.sorting)
    if (propState.columnFilters) setColumnFilters(propState.columnFilters)
    if (propState.columnVisibility) setColumnVisibility(propState.columnVisibility)
  }, [propState])

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
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
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? 'Loading...' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
