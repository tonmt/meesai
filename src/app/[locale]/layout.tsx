import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import SessionProvider from '@/components/SessionProvider';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased pb-16 md:pb-0">
                <SessionProvider>
                    <NextIntlClientProvider messages={messages}>
                        <Navbar />
                        <main>{children}</main>
                        <BottomNav />
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
