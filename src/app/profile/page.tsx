"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserName as updateUserNameAction, userExist } from "@/store/reducer/userReducer";
import { updateUserName as updateUserNameApi, fetchUser } from "@/app/services/api";
import Link from "next/link";
import { ChevronRight, Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveUserAddress, fetchAddress } from "@/app/services/api";
import SessionExpiredNotice from "@/components/SessionExpiredNotice";
import { isAuthError } from "@/utils/authError";
import { userNotExist } from "@/store/reducer/userReducer";

export default function ProfilePage() {

  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [checkingUser, setCheckingUser] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // If user not in Redux, fetch from backend
    if (!user) {
      setCheckingUser(true);
      setLoading(true);
      fetchUser().then(res => {
        if (res && res.result && res.result.user) {
          dispatch(userExist(res.result.user));
          setName(res.result.user.name || "");
        } else {
          setSessionExpired(true);
        }
      }).catch((error) => {
        if (isAuthError(error)) {
          setSessionExpired(true);
          return;
        }
      }).finally(() => {
        setCheckingUser(false);
        setLoading(false);
      });
    } else {
      setName(user.name || "");
      setCheckingUser(false);
    }
    // eslint-disable-next-line
  }, [dispatch, user]);

  if (checkingUser || loading) return <Loading />;
  if (sessionExpired || !user) {
    return (
      <div className="oe-store-page oe-profile-page">
        <SessionExpiredNotice
          description="Your profile session has expired. Log in again if you want to manage your profile."
          loginHref="/login?redirect=/profile"
          buttonLabel="Log In Again"
        />
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || name === user.name) {
      setEditing(false);
      setName(user.name);
      return;
    }
    try {
      const res = await updateUserNameApi(name);
      // console.log("Name updated:", res);
      // API returns { user: {...}, message: "..." }, update Redux with user data
      if (res && (res as any).user) {
        dispatch(userExist((res as any).user));
        setName((res as any).user.name);
      } else if (res && (res as any).name) {
        dispatch(updateUserNameAction((res as any).name));
        setName((res as any).name);
      }
      setEditing(false);
    } catch (e) {
      setEditing(false);
      setName(user.name);
      // Error toast handled globally in axios client
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await Promise.allSettled([createClient().auth.signOut(), fetch("/api/logout", { method: "POST" })]);
    dispatch(userNotExist());
    router.replace("/login");
    router.refresh();
  };

  return (
    <main className="oe-store-page oe-profile-page">
      <header className="oe-account-heading" id="overview"><p className="oe-micro-label oe-micro-label-dark"><span />YOUR ACCOUNT</p><h1>Account</h1><p>Keep your details close for your next fragrance request.</p><button type="button" className="oe-account-signout" onClick={() => void handleSignOut()} disabled={signingOut}><LogOut aria-hidden="true" size={17} />{signingOut ? "Signing out" : "Sign out"}</button></header>
      <nav className="oe-account-nav" aria-label="Account sections"><a href="#overview"><UserRound aria-hidden="true" />Overview<ChevronRight aria-hidden="true" /></a><Link href="/orders"><Package aria-hidden="true" />Orders<ChevronRight aria-hidden="true" /></Link><a href="#profile"><UserRound aria-hidden="true" />Profile<ChevronRight aria-hidden="true" /></a><a href="#addresses"><MapPin aria-hidden="true" />Addresses<ChevronRight aria-hidden="true" /></a><Link href="/wishlist"><Heart aria-hidden="true" />Wishlist<ChevronRight aria-hidden="true" /></Link></nav>
      {/* Name Section */}
      <section className="oe-account-card" id="profile">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-[var(--store-ink)]">Name</span>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        {editing ? (
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                variant="outline"
                className="hover:bg-gray-100 hover:border-gray-400 transition"
              >
                Save
              </Button>
              <Button
                onClick={() => { setName(user.name); setEditing(false); }}
                variant="outline"
                className="hover:bg-gray-100 hover:border-gray-400 transition"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-base text-[var(--store-muted)]">{user.name}</div>
        )}
      </section>
      {/* Email Section */}
      <section className="oe-account-card">
        <span className="text-lg font-semibold text-[var(--store-ink)] mb-1">Email</span>
        <div className="text-base text-[var(--store-muted)]">{user.email}</div>
      </section>
      <section className="oe-account-card oe-account-orders" id="orders">
        <span className="text-lg font-semibold text-[var(--store-ink)]">Orders</span>
        <p className="text-sm text-[var(--store-muted)]">Track all your purchases and payment status.</p>
        <Link href="/orders" className="w-fit">
          <Button size="sm" variant="outline">View My Orders</Button>
        </Link>
      </section>
      {/* Address Section */}
      <section className="oe-account-card" id="addresses">
        <span className="text-lg font-semibold text-[var(--store-ink)] mb-1">Address</span>
        <ProfileAddress userId={user.id} />
      </section>
    </main>
  );
}

// import { useState, useEffect } from "react";

function ProfileAddress({ userId }: { userId: string }) {
  const [address, setAddress] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const emptyForm = { address: "", city: "", state: "", country: "", zip_code: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    loadAddress();
    // eslint-disable-next-line
  }, []);

  const loadAddress = async () => {
    setLoading(true);
    try {
      const res = await fetchAddress();
      // console.log("Fetched address:", res);
      if (Array.isArray(res) && res.length > 0) {
        setAddress(res[0]);
        setForm({
          address: res[0].address ?? "",
          city: res[0].city ?? "",
          state: res[0].state ?? "",
          country: res[0].country ?? "",
          zip_code: res[0].zip_code ?? ""
        });
      } else {
        setAddress(null);
        setForm({ ...emptyForm });
      }
    } catch (e) {
      if (isAuthError(e)) {
        setSessionExpired(true);
        setError("");
      } else {
        setError("Failed to fetch address");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await saveUserAddress(form, userId);
      // console.log("Saved address:", data);
      if (data.success) {
        setAddress(data.result.address);
        setEditing(false);
      } else {
        setError(data.message || "Failed to update address");
      }
    } catch (e: any) {
      if (isAuthError(e)) {
        setSessionExpired(true);
        setError("");
      } else {
        setError(e.message || "Failed to update address");
      }
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-4">Loading address...</div>;
  if (sessionExpired) {
    return (
      <SessionExpiredNotice
        title="Session expired"
        description="Log in again to view or update your address."
        loginHref="/login?redirect=/profile"
        buttonLabel="Log In Again"
      />
    );
  }

  return (
    <div className="w-full">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {address && !editing ? (
        <div className="flex flex-col gap-1">
          <div><span className="font-medium">Address:</span> {address.address}</div>
          <div><span className="font-medium">City:</span> {address.city}</div>
          <div><span className="font-medium">State:</span> {address.state}</div>
          <div><span className="font-medium">Country:</span> {address.country}</div>
          <div><span className="font-medium">Zip Code:</span> {address.zip_code}</div>
          <Button size="sm" variant="outline" className="mt-2 w-fit" onClick={() => setEditing(true)}>Edit</Button>
        </div>
      ) : (
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
          <Input name="state" placeholder="State" value={form.state} onChange={handleChange} />
          <Input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
          <Input name="zip_code" placeholder="Zip Code" value={form.zip_code} onChange={handleChange} />
          <div className="flex gap-2 mt-2">
            <Button type="submit" size="sm" variant="default">Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(false); setForm(address ? {
              address: address.address ?? "",
              city: address.city ?? "",
              state: address.state ?? "",
              country: address.country ?? "",
              zip_code: address.zip_code ?? ""
            } : { ...emptyForm }); }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
