"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseCategory } from "lib/courseCategory";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isDraft: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      name: form.name,
      code: form.code,
      description: form.description,
      isDraft: form.isDraft,

      // ⚠️ REQUIRED (your API needs this)
      certificateTemplate: {
        certificateName: "Default Certificate",
      },
    };

    try {
      const res = await createCourseCategory(payload);

      if (res.success) {
        alert("Created successfully ✅");
        router.push("/course-categories");
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Category</h1>

      {/* NAME */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 w-full mb-3"
      />

      {/* CODE */}
      <input
        name="code"
        value={form.code}
        onChange={handleChange}
        placeholder="Code"
        className="border p-2 w-full mb-3"
      />

      {/* DESCRIPTION */}
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full mb-3"
      />

      {/* DRAFT */}
      <select
        name="isDraft"
        value={form.isDraft ? "true" : "false"}
        onChange={(e) =>
          setForm({ ...form, isDraft: e.target.value === "true" })
        }
        className="border p-2 w-full mb-3"
      >
        <option value="false">Publish</option>
        <option value="true">Save as Draft</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}