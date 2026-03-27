"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CourseCategoriesPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/course-categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Course Categories</h1>

      {/* ✅ ADD BUTTON HERE */}
      <Link href="/course-categories/create">
        <button style={{ marginBottom: "10px" }}>
          ➕ Create Category
        </button>
      </Link>

      {data.map((item) => (
        <div key={item.id}>
          {item.name}
          <Link href={`/course-categories/${item.id}`}>
            <button>Edit</button>
          </Link>
        </div>
      ))}
    </div>
  );
}