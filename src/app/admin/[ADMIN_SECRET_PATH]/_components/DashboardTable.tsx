"use client";

import { Column } from "react-table";
import { format } from "date-fns";
import TableHOC from "./TableHOC";

interface OrderRow {
  id: string;
  customerName: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string | null;
}

const columns: Column<OrderRow>[] = [
  { Header: "Order", accessor: "id", Cell: ({ value }) => `#${String(value).slice(0, 8)}` },
  { Header: "Customer", accessor: "customerName" },
  { Header: "Total", accessor: "total", Cell: ({ value }) => `₹${Number(value).toLocaleString("en-IN")}` },
  { Header: "Payment", accessor: "paymentStatus" },
  { Header: "Status", accessor: "orderStatus" },
  {
    Header: "Placed",
    accessor: "createdAt",
    Cell: ({ value }) => {
      if (!value) return "—";
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy");
    },
  },
];

const DashboardTable = ({ data = [] }: { data: OrderRow[] }): JSX.Element =>
  TableHOC<OrderRow>(columns, data, "transaction-box", "Latest Orders")();

export default DashboardTable;
