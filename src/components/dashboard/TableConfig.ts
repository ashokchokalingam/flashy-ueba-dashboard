export const defaultColumns = [
  { key: "system_time", label: "Time" },
  { key: "computer_name", label: "Computer" },
  { key: "users", label: "Users" },  // Changed from user_id to combine both users
  { key: "title", label: "Title" },
  { key: "tags", label: "Tactics" },
  { key: "target_user_name", label: "Target User" }
];

export const allColumns = [
  ...defaultColumns,
  { key: "description", label: "Description" },
  { key: "event_id", label: "Event ID" },
  { key: "provider_name", label: "Provider" },
  { key: "dbscan_cluster", label: "Cluster" },
  { key: "ip_address", label: "IP Address" },
  { key: "ruleid", label: "Rule ID" },
  { key: "rule_level", label: "Level" },
  { key: "task", label: "Task" },
  { key: "target_domain_name", label: "Target Domain" }
];