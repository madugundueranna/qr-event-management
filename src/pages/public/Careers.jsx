import { useEffect, useState } from "react";
import { FiBriefcase, FiMapPin, FiClock } from "react-icons/fi";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getCareers } from "../../api/contentApi";

const PERKS = [
  { icon: HomeWorkOutlinedIcon,            label: "Flexible / Remote-first"  },
  { icon: HealthAndSafetyOutlinedIcon,     label: "Health & dental insurance" },
  { icon: MenuBookOutlinedIcon,            label: "Learning & dev budget"     },
  { icon: ConfirmationNumberOutlinedIcon,  label: "Free event tickets"        },
  { icon: LunchDiningOutlinedIcon,         label: "Catered lunches (BLR HQ)"  },
  { icon: TrendingUpOutlinedIcon,          label: "ESOPs for all employees"   },
];

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function Careers() {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getCareers()
      .then(setOpenings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-violet-700 to-indigo-700 py-20 text-white">
        <div className="container-page text-center">
          <h1 className="text-5xl font-black">Join Our Team</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80 leading-relaxed">
            Help us build the future of live events in India. We're a small, ambitious team that
            ships fast and takes care of each other.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="mb-10 text-center text-2xl font-black text-slate-900">Why Work Here?</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="glass-card flex items-center gap-4 p-5">
                <Icon sx={{ fontSize: 28, color: "#6366f1" }} />
                <p className="font-semibold text-slate-800">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="container-page py-20">
        <h2 className="mb-10 text-3xl font-black text-slate-900">Open Positions</h2>

        {loading ? (
          <Spinner />
        ) : openings.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiBriefcase className="mx-auto mb-4 text-5xl text-slate-300" />
            <p className="text-xl font-bold">No open positions right now</p>
            <p className="mt-2 text-sm">Check back soon or send an open application below.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {openings.map(({ _id, title, department, location, type, description, applicationEmail }) => (
              <div
                key={_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft hover:-translate-y-0.5 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {department}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
                  </div>
                  <FiBriefcase className="mt-1 shrink-0 text-xl text-indigo-300" />
                </div>

                <p className="mt-3 text-sm text-slate-500 leading-relaxed">{description}</p>

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><FiMapPin /> {location}</span>
                  <span className="flex items-center gap-1.5"><FiClock /> {type}</span>
                </div>

                <button
                  onClick={() => window.location.href = `mailto:${applicationEmail || "careers@qreventix.in"}?subject=Application: ${title}`}
                  className="btn-primary mt-5 w-full py-2.5 text-sm"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-indigo-700 py-16 text-white text-center">
        <div className="container-page">
          <h2 className="text-3xl font-black">Don't See a Fit?</h2>
          <p className="mt-4 text-white/80 max-w-lg mx-auto">
            We're always on the lookout for exceptional people. Send us your CV and we'll reach out
            when a role opens up.
          </p>
          <a
            href="mailto:careers@qreventix.in"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-bold text-indigo-700 hover:bg-indigo-50 transition"
          >
            Send Open Application
          </a>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
