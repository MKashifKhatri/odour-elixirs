"use client"
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  return (
    <div className="oe-store-page oe-request-success">
      <div className="oe-success-mark">
        <MessageCircle size={32} />
      </div>
      <p className="oe-micro-label oe-micro-label-dark"><span />REQUEST SENT</p>
      <h1>
        Thank you for getting in touch.
      </h1>
      <p className="oe-success-copy">
        We’ll confirm availability, delivery and payment with you directly on WhatsApp.
      </p>
      <div className="oe-success-actions">
        <Link href="/orders"><Button variant="outline">View request history</Button></Link>
        <Link href="/products"><Button>Continue exploring</Button></Link>
      </div>
    </div>
  );
}
