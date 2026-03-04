"use client";
import EditableFormInput from "@/src/common/EditableFormInput";
import { useCallApi } from "@/src/hooks/useCallApi";
import useForm from "@/src/hooks/useForm";
import { LayoutDashboard, User, Settings, LogOut, Trophy } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ProfileDetails() {
  const { data, error, loading, refresh } = useCallApi('/api/user');
  const { form, setForm, onChange } = useForm()

  useEffect(() => {
    setForm(data)
  }, [data])

  const onSaveHandler = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const { data, error } = await res.json();

      if (!res.ok) throw new Error(error ?? "Something went wrong");

      toast.success("Profile updated successfully");
      return data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72  border-r border-border-dark bg-background-dark z-20">

        <div className="h-20 flex items-center px-6 border-b border-border-dark">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">playing_cards</span>
            <span className="text-xl font-bold tracking-tight text-white">Flybird <span
              className="text-primary font-light">Game</span></span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-200px)] ">

          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative group">
              <div
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200">
              </div>
              <div className="relative h-24 w-24 rounded-full p-[2px] bg-background-dark">
                <img alt="User avatar of a young man smiling" className="h-full w-full rounded-full object-cover"
                  data-alt="User profile avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0MM1etQhGK-Pd_-2ilrk2tVA7bbUzq_K5bIilNYL_O85MxuRAI3K1Qpw0NDVc3C2LasS_efO_AekaHNRzSRvGGYlgWBZtS55w6kUzT3xYZ7Uvj98nKCYkkvgCWKileAlBl-z1J1cOINNDNUK9uKBN_FYig6LJcdS2JZl6gp7r_xuDDMqPiA7nHpBJIeL9XR88g2cdkYAZtvC5rBtTd_qJVTg3oA-Hc0KF9eItm1OyPa3St6BrCs08qTcUjCTFq5-Msr--QZhzd_I" />
              </div>
              <div
                className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-background-dark">
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{ }</h2>
              <p className="text-secondary text-sm">{data?.display_name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center font-medium">
              <span className="text-white text-sm">Display Name</span>
              <div>
                <EditableFormInput name={"display_name"} value={form?.display_name || ''} onSave={onSaveHandler} />
              </div>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-white text-sm">First Name</span>
              <div>
                <EditableFormInput name={"first_name"} value={form?.first_name || ''} onSave={onSaveHandler} />
              </div>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-white text-sm">Last Name</span>
              <div>
                <EditableFormInput name={"last_name"} value={form?.last_name || ''} onSave={onSaveHandler} />
              </div>
            </div>

          </div>

          <nav className="flex flex-col gap-1 py-2">

          </nav>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div
              className="col-span-2 bg-surface-dark p-4 rounded-xl border border-border-dark flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Best Score</p>
                <p className="text-2xl font-bold text-white mt-1">142</p>
              </div>
              <span className="material-symbols-outlined text-green-500 text-3xl">emoji_events</span>
            </div>
            <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
              <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Plays</p>
              <p className="text-xl font-bold text-white mt-1">200</p>
            </div>
            <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
              <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Latest</p>
              <p className="text-xl font-bold text-white mt-1">58</p>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}