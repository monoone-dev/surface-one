import { useState } from "react";
import { SonePagination } from "@surface-one/react";

export default function PaginationDemo() {
  const [page, setPage] = useState(5);

  return (
    <div className="demo-stack">
      <SonePagination page={page} onPageChange={setPage} total={240} pageSize={20} />
      <p className="text-hint" style={{ textAlign: "center" }}>Showing page {page} of 12</p>
    </div>
  );
}
