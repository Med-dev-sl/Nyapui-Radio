"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  {
    label: "Users",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    children: [
      { label: "Application Users", href: "/admin/users/application" },
      { label: "System Users", href: "/admin/users/system" },
    ],
  },
  { label: "Facebook Live", href: "/admin/facebook-live", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" },
  { label: "Program Schedules", href: "/admin/schedules", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Podcast", href: "/admin/podcast", icon: "M12 21a9 9 0 100-18 9 9 0 000 18z M12 15a3 3 0 100-6 3 3 0 000 6z M9 12a3 3 0 016 0" },
  { label: "News", href: "/admin/news", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  { label: "Shorts", href: "/admin/shorts", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { label: "Notifications", href: "/admin/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { label: "Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openUsers, setOpenUsers] = useState(false);

  const isUsersActive =
    pathname === "/admin/users/application" || pathname === "/admin/users/system";

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 min-h-screen flex flex-col py-4 shadow-sm">
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link, i) => {
          if ("children" in link) {
            return (
              <div key={link.label} className="animate-fade-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  onClick={() => setOpenUsers(!openUsers)}
                  className={`group relative w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isUsersActive
                      ? "bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] text-white shadow-md"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-sm"
                  }`}
                >
                  {isUsersActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  <span className="flex items-center gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isUsersActive ? "text-white" : "text-zinc-400 group-hover:text-[#1a4b8c]"
                      }`}
                    >
                      <path d={link.icon} />
                    </svg>
                    {link.label}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ${openUsers ? "rotate-180" : ""} ${
                      isUsersActive ? "text-white/80" : "text-zinc-400"
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openUsers && (
                  <div className="ml-6 mt-1 flex flex-col gap-1 overflow-hidden animate-slide-down">
                    {link.children.map((child) => {
                      const active = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`relative rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                            active
                              ? "bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] text-white shadow-md"
                              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:pl-5"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                          )}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href!}
              className={`animate-fade-slide-in group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] text-white shadow-md"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-sm hover:pl-4"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-200 group-hover:scale-110 ${
                  active ? "text-white" : "text-zinc-400 group-hover:text-[#1a4b8c]"
                }`}
              >
                <path d={link.icon!} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
