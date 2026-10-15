"use client";

import StaggeredMenu from "@/components/reactbits/StaggeredMenu";
import { nav, site } from "@/lib/content";

export default function Header() {
  return (
    <StaggeredMenu
      items={nav}
      socialItems={site.socials}
      colors={["#FD62C2", "#161618"]}
      footer={
        <div className="flex flex-col gap-1 text-base">
          <a href={site.phoneHref} className="inline-flex min-h-11 items-center font-semibold hover:text-pink-deep">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center font-semibold hover:text-pink-deep">
            {site.email}
          </a>
        </div>
      }
    />
  );
}
