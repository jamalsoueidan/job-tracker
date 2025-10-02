// components/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function ChangeTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div>
      <button onClick={() => switchLocale("en")}>English</button>
      <button onClick={() => switchLocale("da")}>Dansk</button>
    </div>
  );
}
