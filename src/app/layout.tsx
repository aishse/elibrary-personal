// import type { Metadata } from "next";
// import "./globals.css";



// export const metadata: Metadata = {
//   title: "ELibrary",
//   description: "Virtual Book Manager",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>
//         {children}
//       </body>
//     </html>
//   );
// }
import { AuthProvider } from './context/AuthContext'; // Adjust the import path if necessary
import type { Metadata } from "next";
import "./globals.css";
import Navbar from './components/navbar';

export const metadata: Metadata = {
  title: "ELibrary",
  description: "Virtual Book Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children} {/* All pages and components can access the AuthContext now */}
        </AuthProvider>
      </body>
    </html>
  );
}
