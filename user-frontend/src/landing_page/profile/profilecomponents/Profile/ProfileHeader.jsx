import { Mail, Phone, User } from "lucide-react";

export default function ProfileHeader({ profile, onEdit }) {
  return (
    <div className="bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-800">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-sm backdrop-blur-sm">
              <User size={26} />
            </div>
            <div className="leading-tight text-white">
              <div className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
                {profile.name}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/90">
                <div className="flex items-center gap-1.5">
                  <Phone size={15} strokeWidth={2.4} />
                  <span>{profile.phone}</span>
                </div>
                <span aria-hidden="true" className="text-white/70">
                  •
                </span>
                <div className="flex items-center gap-1.5">
                  <Mail size={15} strokeWidth={2.4} />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-none border border-white/70 bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
