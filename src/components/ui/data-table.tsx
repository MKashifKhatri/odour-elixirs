"use client";
import type { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "./table";
import { Skeleton } from "./skeleton";
import { Button } from "./button";

export type DataColumn<T> = { key: string; heading: string; render: (row: T) => ReactNode };
export function DataTable<T>({ caption, columns, rows, rowKey, loading = false, error, onRetry, emptyMessage = "No records yet.", selectedKeys = [] }: { caption: string; columns: DataColumn<T>[]; rows: T[]; rowKey: (row: T) => string; loading?: boolean; error?: string; onRetry?: () => void; emptyMessage?: string; selectedKeys?: string[] }) {
  return <div className="ds-data-table" aria-busy={loading}><Table><TableCaption>{caption}</TableCaption><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key} scope="col">{column.heading}</TableHead>)}</TableRow></TableHeader><TableBody>{loading ? Array.from({ length: 3 }, (_, index) => <TableRow key={index}>{columns.map((column) => <TableCell key={column.key}><Skeleton /></TableCell>)}</TableRow>) : error ? <TableRow><TableCell colSpan={columns.length}><div role="alert" className="ds-table-message"><p>{error}</p>{onRetry && <Button type="button" variant="secondary" onClick={onRetry}>Try again</Button>}</div></TableCell></TableRow> : rows.length ? rows.map((row) => <TableRow key={rowKey(row)} data-state={selectedKeys.includes(rowKey(row)) ? "selected" : undefined}>{columns.map((column) => <TableCell key={column.key}>{column.render(row)}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length}><p className="ds-table-message">{emptyMessage}</p></TableCell></TableRow>}</TableBody></Table>{loading && <span className="sr-only" role="status">Loading {caption.toLowerCase()}</span>}</div>;
}
