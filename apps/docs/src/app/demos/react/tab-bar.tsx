import { useState } from "react";
import { SoneTabBar, type TabBarItem } from "@surface-one/react";

const items: TabBarItem[] = [
  { value: "home", label: "Home", icon: "dashboards" },
  { value: "search", label: "Search", icon: "search" },
  { value: "inbox", label: "Inbox", icon: "bell" },
  { value: "profile", label: "Profile", icon: "user" },
];

export default function TabBarDemo() {
  const [tab, setTab] = useState("home");
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem" }}>
      <SoneTabBar ariaLabel="Demo app" items={items} value={tab} onValueChange={setTab} />
      <SoneTabBar
        ariaLabel="Demo app, full width"
        items={items}
        value={tab}
        onValueChange={setTab}
        floating={false}
        labels="always"
      />
      <p className="text-hint">Active tab: {tab}</p>
    </div>
  );
}
