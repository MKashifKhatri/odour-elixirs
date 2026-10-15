"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SizeSelector } from "@/components/ui/size-selector";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Accordion } from "@/components/ui/accordion";
import { Tabs } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import ScentProductCard from "@/components/ScentProductCard";
import { demoProducts } from "@/lib/demoCatalog";

const sections = ["Buttons", "Forms", "Selection", "Products", "Disclosure", "Overlays", "Feedback", "Tables"];
function Example({ label, children }: { label: string; children: ReactNode }) { return <div className="ds-demo"><span className="ds-demo-label">{label}</span>{children}</div>; }
const sizes = [{ value: "30", label: "30 ml" }, { value: "50", label: "50 ml" }, { value: "100", label: "100 ml", disabled: true }];
const options = <><option value="">Choose a family</option><option value="fresh">Fresh</option><option value="woody">Woody</option><option value="amber" disabled>Amber — unavailable</option></>;
const photoProduct = { ...demoProducts[0], image: "/brand/oe-campaign-hero.jpg", images: ["/brand/oe-campaign-hero.jpg", "/brand/oe-black.svg"] };
type Row = { id: string; name: string; status: BadgeTone; total: number };
const rows: Row[] = Array.from({ length: 24 }, (_, index) => ({ id: `DEMO-${String(index + 1).padStart(3, "0")}`, name: demoProducts[index % demoProducts.length].name, status: (["success", "warning", "neutral", "error"] as BadgeTone[])[index % 4], total: 1199 + index * 100 }));
const columns: DataColumn<Row>[] = [
  { key: "id", heading: "Order", render: (row) => row.id },
  { key: "name", heading: "Fragrance", render: (row) => row.name },
  { key: "status", heading: "Status", render: (row) => <Badge tone={row.status}>{{ success: "Confirmed", warning: "Pending", neutral: "Draft", error: "Cancelled" }[row.status]}</Badge> },
  { key: "total", heading: "Total", render: (row) => `₹${row.total.toLocaleString("en-IN")}` },
];

function OverlayDemo({ panel = false }: { panel?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("default");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const Root = panel ? Sheet : Dialog;
  const Trigger = panel ? SheetTrigger : DialogTrigger;
  const Content = panel ? SheetContent : DialogContent;
  const Header = panel ? SheetHeader : DialogHeader;
  const Title = panel ? SheetTitle : DialogTitle;
  const Description = panel ? SheetDescription : DialogDescription;
  const Close = panel ? SheetClose : DialogClose;
  return <Root open={open} onOpenChange={(next) => { clearTimeout(timer.current); setOpen(next); if (next) { setState("default"); setError(""); } }}><Trigger asChild><Button type="button" variant="secondary">Open {panel ? "slide-over" : "modal"}</Button></Trigger><Content><Header><Title>{panel ? "Edit fragrance" : "Save your preferences"}</Title><Description>Local demonstration. Escape closes; focus returns to the trigger.</Description></Header><div className="stack">
    <Select label="Preview state" value={state} onChange={(event) => { clearTimeout(timer.current); setState(event.target.value); }}><option value="default">Default</option><option value="loading">Loading</option><option value="error">Error</option><option value="success">Success</option><option value="empty">Empty</option><option value="disabled">Disabled</option></Select>
    {state === "loading" ? <div role="status" aria-label="Loading preferences" className="stack"><Skeleton /><Skeleton /><Skeleton className="ds-skeleton-short" /></div> : state === "success" ? <p role="status" className="ds-success">Preferences saved for this preview.</p> : state === "empty" ? <div><p>No preferences yet.</p><Button type="button" onClick={() => setState("default")}>Add preferences</Button></div> : <form className="stack" noValidate onSubmit={(event) => { event.preventDefault(); if (!name.trim()) { setError("Enter a name to continue."); return; } setError(""); setState("loading"); timer.current = setTimeout(() => setState("success"), 800); }}><Input label="Name" autoComplete="name" value={name} disabled={state === "disabled"} error={error || (state === "error" ? "We couldn’t save your preferences. Please try again." : undefined)} onChange={(event) => { setName(event.target.value); setError(""); }} /><Button type="submit" disabled={state === "disabled"}>Save preferences</Button></form>}
    <Close asChild><Button type="button" variant="link">Close</Button></Close>
  </div></Content></Root>;
}

export default function StyleGuide() {
  const [size, setSize] = useState("50");
  const [quantity, setQuantity] = useState(2);
  const [minimum, setMinimum] = useState(1);
  const [maximum, setMaximum] = useState(5);
  const [page, setPage] = useState(1);
  const [retryError, setRetryError] = useState(true);
  const [event, setEvent] = useState("Try any interactive example.");
  return <div className="brand-container ds-guide">
    <header><p>Odour Elixirs · Design system</p><h1>Considered, down to the controls.</h1><p>A reusable component library built on the foundation tokens. All examples use local state; no customer data is submitted.</p><nav className="ds-guide-nav" aria-label="Style guide sections">{sections.map((section) => <a key={section} href={`#guide-${section.toLowerCase()}`}>{section}</a>)}</nav><p role="status" aria-live="polite">{event}</p></header>

    <section id="guide-buttons"><h2>Buttons</h2><p>Hover, active, and focus samples are forced visual previews. The other examples respond to pointer and keyboard input.</p>{(["primary", "secondary", "link"] as const).map((variant) => <div key={variant}><h3>{variant === "link" ? "Text link" : variant === "primary" ? "Primary" : "Secondary"}</h3><div className="ds-demo-grid">{["default", "hover", "active", "focus", "disabled", "loading"].map((state) => <Example key={state} label={state}><Button type="button" variant={variant} data-preview={state} disabled={state === "disabled"} loading={state === "loading"} loadingLabel="Adding…" onClick={() => setEvent(`${variant} button activated.`)}>Add to bag</Button></Example>)}</div></div>)}<div className="ds-demo-row"><Button variant="ghost" onClick={() => setEvent("Ghost button activated.")}>Ghost</Button><Button variant="destructive" onClick={() => setEvent("Demo only: nothing was removed.")}>Remove</Button><Button asChild variant="link"><a href="#guide-forms">Link as child</a></Button><Button asChild disabled><a href="#guide-forms">Disabled link</a></Button></div><div className="section-dark ds-demo-surface"><h3>On a dark surface</h3><div className="ds-demo-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="link">Text link</Button><Badge tone="success">Confirmed</Badge></div></div></section>

    <section id="guide-forms"><h2>Inputs and select</h2><p>Floating labels remain visible when filled, focused, or autofilled. Error messages are linked to their fields.</p><div className="ds-demo-grid">
      <Example label="Empty"><Input label="Email" type="email" autoComplete="email" /></Example>
      <Example label="Filled"><Input label="Name" defaultValue="Avery" autoComplete="name" /></Example>
      <Example label="Focus preview"><Input label="Email" defaultValue="avery@example.com" data-preview="focus" /></Example>
      <Example label="Error"><Input label="Email" defaultValue="avery@" error="Enter a valid email address." /></Example>
      <Example label="Success"><Input label="Email" defaultValue="avery@example.com" success="Email address verified." /></Example>
      <Example label="Disabled"><Input label="Name" defaultValue="Unavailable" disabled /></Example>
      <Example label="Read only"><Input label="Account reference" value="OE-001" readOnly /></Example>
      <Example label="Loading"><Input label="Email" defaultValue="avery@example.com" loading hint="Checking this email address…" /></Example>
      <Example label="Required and hint"><Input label="Password" type="password" required autoComplete="new-password" hint="Use at least 12 characters." /></Example>
      <Example label="Select — default"><Select label="Scent family" defaultValue="">{options}</Select></Example>
      <Example label="Select — selected"><Select label="Scent family" defaultValue="woody">{options}</Select></Example>
      <Example label="Select — focus"><Select label="Scent family" defaultValue="fresh" data-preview="focus">{options}</Select></Example>
      <Example label="Select — error"><Select label="Scent family" defaultValue="" error="Choose a scent family.">{options}</Select></Example>
      <Example label="Select — disabled"><Select label="Scent family" defaultValue="fresh" disabled>{options}</Select></Example>
      <Example label="Select — loading / empty"><Select label="Scent family" disabled hint="Loading options…"><option>Loading…</option></Select><Select label="Empty collection" disabled><option>No options available</option></Select></Example>
    </div></section>

    <section id="guide-selection"><h2>Selection controls</h2><div className="ds-demo-grid">
      <Example label="Checkbox states"><Checkbox label="Unchecked" /><Checkbox label="Checked" defaultChecked /><Checkbox label="Partially selected" indeterminate /><Checkbox label="Disabled" disabled /><Checkbox label="Disabled and checked" disabled defaultChecked /><Checkbox label="Required consent" error="Please confirm your consent." /></Example>
      <Example label="Radio states"><fieldset className="ds-fieldset"><legend>Delivery method</legend><RadioGroup defaultValue="standard" aria-label="Delivery method">{["standard", "express", "unavailable"].map((item) => <label className="ds-radio-label" key={item}><RadioGroupItem value={item} disabled={item === "unavailable"} aria-label={item} /><span>{item}</span></label>)}</RadioGroup></fieldset><fieldset className="ds-fieldset"><legend>Required preference</legend><RadioGroup aria-label="Required preference" aria-invalid="true" aria-describedby="radio-error"><label className="ds-radio-label"><RadioGroupItem value="email" aria-label="Email" />Email</label></RadioGroup><p className="ds-error" id="radio-error">Choose a contact preference.</p></fieldset></Example>
      <Example label="Sizes — selected / unavailable"><SizeSelector options={sizes} value={size} onValueChange={setSize} /><SizeSelector label="Sizes — unselected error" options={sizes} onValueChange={(value) => setEvent(`Selected ${value} ml in the error example.`)} error="Choose a size before adding to bag." /><SizeSelector label="Sizes — disabled" options={sizes} value="50" disabled onValueChange={() => undefined} /></Example>
      <Example label="Quantity — interactive"><QuantityStepper value={quantity} min={1} max={5} onValueChange={setQuantity} /><p>Stock limit: 5. Edit the number, use arrows, or press the buttons.</p></Example>
      <Example label="Quantity — minimum / maximum"><QuantityStepper label="Minimum quantity" value={minimum} min={1} max={5} onValueChange={setMinimum} /><QuantityStepper label="Maximum quantity" value={maximum} min={1} max={5} onValueChange={setMaximum} /></Example>
      <Example label="Quantity — disabled"><QuantityStepper value={2} disabled onValueChange={() => undefined} /></Example>
    </div></section>

    <section id="guide-products"><h2>Product cards</h2><p>Hover or focus the first image to reveal the second. The brand mark is a demo-only alternate image. Touch users can open the product gallery on real cards.</p><div className="ds-demo-grid"><Example label="Available / hover / wishlist"><ScentProductCard product={photoProduct} preview /></Example><Example label="Unavailable / disabled"><ScentProductCard product={{ ...photoProduct, is_active: false }} preview /></Example><Example label="Multiple sizes"><ScentProductCard product={{ ...demoProducts[1], sizes: ["30 ml", "50 ml"] }} preview /></Example><Example label="Image missing / fallback"><ScentProductCard product={{ ...demoProducts[2], image: "", images: [] }} preview /></Example><Example label="Loading"><div className="stack" role="status" aria-label="Loading fragrance"><Skeleton className="ds-skeleton-media" /><Skeleton /><Skeleton className="ds-skeleton-short" /></div></Example></div></section>

    <section id="guide-disclosure"><h2>Accordion and tabs</h2><div className="ds-demo-grid"><Example label="Open, closed, disabled"><Accordion defaultOpen={["notes"]} items={[{ id: "notes", title: "Fragrance notes", content: <p>Top: bergamot. Heart: rose. Base: amber.</p> }, { id: "care", title: "Care and storage", content: <p>Store away from direct sunlight.</p> }, { id: "unavailable", title: "Reviews unavailable", disabled: true, content: null }]} /></Example><Example label="Tabs — active, inactive, disabled"><Tabs label="Product information" items={[{ value: "details", label: "Details", content: <p>Thoughtfully composed fragrance.</p> }, { value: "notes", label: "Notes", content: <p>Amber, rose, and polished woods.</p> }, { value: "reviews", label: "Reviews", disabled: true, content: null }]} /><p>Use Left/Right arrows, Home, and End.</p></Example><Example label="Loading, empty, error panels"><Tabs label="Content states" items={[{ value: "loading", label: "Loading", content: <div role="status" aria-label="Loading details"><Skeleton /></div> }, { value: "empty", label: "Empty", content: <p>No reviews yet.</p> }, { value: "error", label: "Error", content: <p className="ds-error" role="alert">Details could not be loaded.</p> }]} /></Example></div></section>

    <section id="guide-overlays"><h2>Modal and slide-over</h2><p>Open either component to preview default, loading, error, success, empty, and disabled states. Tab stays inside the overlay. Escape and the close button dismiss it.</p><div className="ds-demo-row"><OverlayDemo /><OverlayDemo panel /></div></section>

    <section id="guide-feedback"><h2>Feedback</h2><h3>Badges and status pills</h3><div className="ds-demo-row"><Badge>Draft</Badge><Badge tone="success">Confirmed</Badge><Badge tone="warning">Pending</Badge><Badge tone="error">Cancelled</Badge></div><h3>Toast states</h3><div className="ds-demo-grid">{(["neutral", "success", "warning", "error"] as const).map((tone) => <Example key={tone} label={tone}><div className={`ds-toast ds-toast-${tone} ds-toast-preview`}><strong>{{ neutral: "A note from the house", success: "Changes saved", warning: "Stock is running low", error: "Changes could not be saved" }[tone]}</strong><p>This is a persistent visual sample.</p></div><Button type="button" variant="secondary" onClick={() => toast({ title: `${tone === "error" ? "Error" : tone === "success" ? "Success" : tone === "warning" ? "Warning" : "Information"}: demo notification`, description: "No live data has changed. Press F8 to focus notifications.", variant: tone === "error" ? "destructive" : tone === "neutral" ? "default" : tone, action: <ToastAction altText="Acknowledge demo notification" onClick={() => setEvent("Demo notification acknowledged.")}>Got it</ToastAction> })}>Show {tone} toast</Button></Example>)}</div><h3>Skeletons</h3><div className="ds-demo-grid"><Example label="Text loading"><div className="stack" role="status" aria-label="Loading text"><Skeleton /><Skeleton className="ds-skeleton-short" /></div></Example><Example label="Image loading"><Skeleton className="ds-skeleton-media" /></Example><Example label="Reduced motion"><p>Enable reduced motion in your device settings to stop skeleton pulsing and component animation.</p></Example></div></section>

    <section id="guide-tables"><h2>Data table and pagination</h2><p>The header stays visible inside the scroll region. Rows highlight on hover, keyboard focus within a row, and selection.</p><DataTable caption="Demo orders" rows={rows.slice((page - 1) * 8, page * 8)} columns={columns} rowKey={(row) => row.id} selectedKeys={[rows[0].id]} /><div className="ds-demo-row"><Pagination page={page} pageCount={3} onPageChange={setPage} /></div><h3>Table states</h3><DataTable caption="Loading orders" rows={[]} columns={columns} rowKey={(row) => row.id} loading /><DataTable caption="Empty orders" rows={[]} columns={columns} rowKey={(row) => row.id} /><DataTable caption="Retry example" rows={retryError ? [] : rows.slice(0, 1)} columns={columns} rowKey={(row) => row.id} error={retryError ? "We couldn’t load these orders." : undefined} onRetry={() => setRetryError(false)} /><h3>Pagination states</h3><div className="ds-demo-grid"><Example label="First page"><Pagination page={1} pageCount={10} onPageChange={(value) => setEvent(`Demo page ${value} requested.`)} /></Example><Example label="Last page"><Pagination page={10} pageCount={10} onPageChange={(value) => setEvent(`Demo page ${value} requested.`)} /></Example><Example label="Single / empty page"><Pagination page={1} pageCount={0} onPageChange={() => undefined} /></Example><Example label="Disabled / loading"><Pagination page={2} pageCount={3} disabled onPageChange={() => undefined} /></Example></div></section>
  </div>;
}
