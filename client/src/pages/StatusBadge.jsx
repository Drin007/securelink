
const statusColors = {
  phishing: "bg-red-600 text-white",
  malware: "bg-orange-500 text-white",
  "fake store": "bg-yellow-500 text-black",
  safe: "bg-green-600 text-white",
  other: "bg-gray-500 text-white",
};

export default function StatusBadge({ reason }) {
  const key = reason?.toLowerCase() || "other";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[key] || statusColors.other}`}
    >
      {reason || "Unknown"}
    </span>
  );
}
