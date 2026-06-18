import './globals.css';
import { getContent } from '@/lib/content';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata() {
  const c = await getContent();
  return {
    title: c.site.title,
    description: c.site.description,
    metadataBase: new URL(`https://${c.site.domain}`),
    alternates: { canonical: `https://${c.site.domain}/` },
    openGraph: {
      type: 'website', title: c.site.title, description: c.site.description,
      images: ['/assets/headshot.jpg'],
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23161412'/><text x='50' y='72' font-size='64' font-family='Arial' font-weight='900' fill='%2340a3c9' text-anchor='middle'>B</text></svg>" },
  };
}

export default async function RootLayout({ children }) {
  const c = await getContent();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Nav brand={c.site.brand} email={c.site.email} pages={c.pages} />
        <main id="top">{children}</main>
        <Footer site={c.site} />
      </body>
    </html>
  );
}
