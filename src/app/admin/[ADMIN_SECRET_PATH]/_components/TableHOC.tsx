"use client"

import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import {
  Column,
  usePagination,
  useSortBy,
  useTable,
  TableOptions,
  Row,
  HeaderGroup,
  Cell,
  TableState,
  UsePaginationInstanceProps,
  UsePaginationState,
  UseSortByColumnProps,
  TableInstance
} from "react-table";
import Link from "next/link";
import { ADMIN_SECRET_PATH } from "./AdminSidebar";
import { usePathname } from "next/navigation";

function TableHOC<T extends Object>(
  columns: Column<T>[],
  data: T[],
  containerClassname: string,
  heading: string,
  showPagination: boolean = false,
  showAddButton: boolean = false,
  pageSize: number = 6
) {
  return function HOC() {
    const options: TableOptions<T> & {
      initialState: Partial<TableState<T> & UsePaginationState<T>>
    } = {
      columns,
      data,
      initialState: {
        pageSize: pageSize,
      },
    };

    const path = usePathname();

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      prepareRow,
      nextPage,
      pageCount,
      state: { pageIndex },
      previousPage,
      canNextPage,
      canPreviousPage,
    } = useTable(options, useSortBy, usePagination) as TableInstance<T> & 
        UsePaginationInstanceProps<T> & {
          state: TableState<T> & UsePaginationState<T>;
        };

    return (
      <div className={`w-full ${containerClassname}`}> 
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">{heading}</h2>
          </div>
          {showAddButton && (
            path === `/admin/${ADMIN_SECRET_PATH}/products` ? (
              <Link href={`/admin/${ADMIN_SECRET_PATH}/product/new`}>
                <button className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-gray-800">
                  Add Product
                </button>
              </Link>
            ) : path === `/admin/${ADMIN_SECRET_PATH}/categories` ? (
              <Link href={`/admin/${ADMIN_SECRET_PATH}/category/new`}>
                <button className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-gray-800">
                  Add Category
                </button>
              </Link>
            ) : null
          )}
        </div>

        <div className="w-full overflow-x-auto bg-white">
          <table className="min-w-[600px] w-full border-collapse" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup: HeaderGroup<T>) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                  {headerGroup.headers.map((column) => {
                    const sortProps = (column as unknown as UseSortByColumnProps<T>);
                    return (
                      <th 
                        scope="col"
                        {...column.getHeaderProps(sortProps.getSortByToggleProps())} 
                        key={column.id}
                        className={`px-4 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wider text-gray-500 ${column.id === 'photo' ? 'w-1/4' : column.id === 'name' ? 'w-1/3' : ''}`}
                      >
                        {column.render("Header")}
                        {sortProps.isSorted && (
                          <span className="inline-flex align-middle ml-1">
                            {sortProps.isSortedDesc ? (
                              <AiOutlineSortDescending />
                            ) : (
                              <AiOutlineSortAscending />
                            )}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white">
              {page.length === 0 ? <tr><td colSpan={headerGroups[0]?.headers.length || 1} className="px-4 py-10 text-center text-sm text-gray-500">No records to show.</td></tr> : page.map((row: Row<T>) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    {row.cells.map((cell: Cell<T>) => (
                      <td {...cell.getCellProps()} key={cell.column.id} className="px-4 py-3 text-sm text-gray-700" scope="row">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showPagination && (
          <div className="flex flex-row items-center justify-center px-4 py-4 gap-2 border-t border-gray-200 bg-gray-50/80">
            <button 
              disabled={!canPreviousPage} 
              onClick={previousPage}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-900 text-white text-xs sm:text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="mx-2 sm:mx-4 text-xs sm:text-sm text-gray-600">{`${pageIndex + 1} of ${pageCount}`}</span>
            <button 
              disabled={!canNextPage} 
              onClick={nextPage}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-900 text-white text-xs sm:text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };
}

export default TableHOC;
