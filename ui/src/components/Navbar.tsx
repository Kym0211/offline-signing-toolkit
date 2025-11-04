// "use client";
// import {
//   Navbar,
//   NavBody,
//   NavItems,
//   MobileNav,
//   NavbarLogo,
//   NavbarButton,
//   MobileNavHeader,
//   MobileNavToggle,
//   MobileNavMenu,
// } from "@/components/ui/resizable-navbar";
// import { useState } from "react";

// export function NavbarDemo() {
//   const navItems = [
//     {
//       name: "Features",
//       link: "#features",
//     },
//     {
//       name: "Pricing",
//       link: "#pricing",
//     },
//     {
//       name: "Contact",
//       link: "#contact",
//     },
//   ];

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <div className="relative w-full">
//       <Navbar>
//         {/* Desktop Navigation */}
//         <NavBody>
//           <NavbarLogo />
//           <NavItems items={navItems} />
//           <div className="flex items-center gap-4">
//             <NavbarButton variant="secondary">Login</NavbarButton>
//             <NavbarButton variant="primary">Book a call</NavbarButton>
//           </div>
//         </NavBody>

//         {/* Mobile Navigation */}
//         <MobileNav>
//           <MobileNavHeader>
//             <NavbarLogo />
//             <MobileNavToggle
//               isOpen={isMobileMenuOpen}
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             />
//           </MobileNavHeader>

//           <MobileNavMenu
//             isOpen={isMobileMenuOpen}
//             onClose={() => setIsMobileMenuOpen(false)}
//           >
//             {navItems.map((item, idx) => (
//               <a
//                 key={`mobile-link-${idx}`}
//                 href={item.link}
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className="relative text-neutral-600 dark:text-neutral-300"
//               >
//                 <span className="block">{item.name}</span>
//               </a>
//             ))}
//             <div className="flex w-full flex-col gap-4">
//               <NavbarButton
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 variant="primary"
//                 className="w-full"
//               >
//                 Login
//               </NavbarButton>
//               <NavbarButton
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 variant="primary"
//                 className="w-full"
//               >
//                 Book a call
//               </NavbarButton>
//             </div>
//           </MobileNavMenu>
//         </MobileNav>
//       </Navbar>

//     </div>
//   );
// }


"use client";

import Link from "next/link"; // We still need Link for the other routes
import { ShieldCheck, Download } from "lucide-react"; // Added Download icon

export function Navbar() {
  return (
    <nav className="w-full border-b border-gray-700 bg-gray-900/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 text-white">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold">OfflineSigner</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/transfer-sol" className="text-gray-300 hover:text-white">
            Transfer SOL
          </Link>
          <Link href="/transfer-token" className="text-gray-300 hover:text-white">
            Transfer Token
          </Link>
          <Link href="/broadcast" className="text-gray-300 hover:text-white">
            Broadcast
          </Link>

          {/* --- THIS IS THE MODIFIED BUTTON --- */}
          <a
            href="/offline.html" // Points to the static file that will be built
            download="signer.html" // Tells the browser to download it with this name
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Signer
          </a>
        </div>
      </div>
    </nav>
  );
}

