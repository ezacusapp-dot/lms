"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ================= GET DATA =================
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/course-categories/${id}`);
      const result = await res.json();

      if (result.success) {
        setForm({
  name: result.data.name,
  code: result.data.code,
  description: result.data.description,
  isActive: result.data.isActive,
});
      }
    };

    fetchData();
  }, [id]);

  // ================= HANDLE INPUT =================
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleUpdate = async () => {
  setLoading(true);

  const payload = {
    name: form.name,
    code: form.code,
    description: form.description,
    isActive: form.isActive,
  };

  const res = await fetch(`/api/course-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (result.success) {
    alert("Updated successfully ✅");
  } else {
    alert(result.error);
  }

  setLoading(false);
};
  // ================= DELETE =================
  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/course-categories/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (result.success) {
      alert("Deleted successfully 🗑️");
      router.push("/course-categories");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>

      {/* NAME */}
      <input
        name="name"
        value={form.name || ""}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 w-full mb-3"
      />

      {/* CODE */}
      <input
        name="code"
        value={form.code || ""}
        onChange={handleChange}
        placeholder="Code"
        className="border p-2 w-full mb-3"
      />

      {/* DESCRIPTION */}
      <textarea
        name="description"
        value={form.description || ""}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full mb-3"
      />

      {/* ACTIVE */}
      <select
        name="isActive"
        value={form.isActive ? "true" : "false"}
        onChange={(e) =>
          setForm({ ...form, isActive: e.target.value === "true" })
        }
        className="border p-2 w-full mb-3"
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>

      {/* BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white px-4 py-2"
        >
          {loading ? "Updating..." : "Update"}
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
}