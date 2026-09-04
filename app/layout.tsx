import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitLeak Finder — Découvrez vos métadonnées Git publiques',
  description:
    "GitLeak Finder analyse l'historique public des commits Git pour révéler les adresses email des auteurs — exactement comme git log. Un outil de sensibilisation OSINT pour l'hygiène numérique.",
  keywords: [
    'git',
    'OSINT',
    'email',
    'sécurité',
    'cybersécurité',
    'métadonnées',
    'commits',
    'sensibilisation',
  ],
  authors: [{ name: 'GitLeak Finder Project' }],
  openGraph: {
    title: 'GitLeak Finder — Vos emails dans vos commits publics',
    description:
      "Découvrez quelles adresses email sont exposées dans l'historique public de vos dépôts Git.",
    type: 'website',
    locale: 'fr_FR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
