"use client";

import { useState } from "react";

import ShiftForm from "./ShiftForm";
import ShiftList from "./ShiftList";

export default function ShiftManagement() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <ShiftForm onShiftCreated={() => setRefreshKey((key) => key + 1)} />
      <div>
        <h3 className="text-lg font-semibold">Scheduled shifts</h3>
        <ShiftList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
