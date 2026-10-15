"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { userExist } from "@/store/reducer/userReducer";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate login (replace with real API call)
    setTimeout(() => {
      if (email && name) {
        // Simulate AuthUser object
        dispatch(userExist({
          user: "",
          id: "demo-id",
          name,
          email,
          is_admin: false
        }));
        onClose();
      } else {
        setError("Please enter your name and email.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2">Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
