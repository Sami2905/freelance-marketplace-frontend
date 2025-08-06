import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  RowData,
  ColumnDefBase,
  TableMeta as ReactTableMeta,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Extend the TableMeta interface to include our custom properties
  interface TableMeta<TData extends RowData> extends ReactTableMeta<TData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }

  // Re-export types that we use
  export {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
    RowData,
    ColumnDefBase,
  };
}
