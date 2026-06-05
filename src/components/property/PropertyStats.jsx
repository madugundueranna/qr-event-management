// src/components/property/PropertyStats.jsx

import { FiDownload, FiEye, FiHeart, FiMessageCircle } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";

const icons = {
  views: <FiEye />,
  downloads: <FiDownload />,
  quoteRequests: <FiMessageCircle />,
  siteVisits: <FiCalendar />,
  shortlisted: <FiHeart />,
};

const labels = {
  views: "Total Views",
  downloads: "Brochure Downloads",
  quoteRequests: "Quote Requests",
  siteVisits: "Site Visits",
  shortlisted: "Shortlisted",
};

const colors = {
  views: "bg-blue-50 text-blue-600",
  downloads: "bg-primary-50 text-primary-600",
  quoteRequests: "bg-orange-50 text-orange-600",
  siteVisits: "bg-green-50 text-green-600",
  shortlisted: "bg-red-50 text-red-500",
};

export default function PropertyStats({ property }) {
  const fields = ["views", "downloads", "quoteRequests", "siteVisits"];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((key) =>
        property[key] !== undefined ? (
          <div key={key} className="glass-card flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${colors[key]}`}
            >
              {icons[key]}
            </div>
            <div>
              <p className="text-sm text-slate-500">{labels[key]}</p>
              <p className="mt-0.5 text-2xl font-black text-ink-900">
                {property[key].toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
