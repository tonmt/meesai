import StickyHeader from '@/components/landing/StickyHeader';
import HeroSection from '@/components/landing/HeroSection';
import BookingEngine from '@/components/landing/BookingEngine';
import OccasionNav from '@/components/landing/OccasionNav';
import DynamicFeed from '@/components/landing/DynamicFeed';
import TrustSection from '@/components/landing/TrustSection';
import OwnerZone from '@/components/landing/OwnerZone';
import Footer from '@/components/landing/Footer';
import BottomNav from '@/components/landing/BottomNav';
import { getFeedProducts, getCategories } from '@/actions/products';

export default async function LandingPage() {
    const [products, categories] = await Promise.all([
        getFeedProducts(),
        getCategories(),
    ]);

    return (
        <>
            <StickyHeader />
            <main>
                <HeroSection />
                <BookingEngine />
                <OccasionNav />
                <DynamicFeed products={products} categories={categories} />
                <TrustSection />
                <OwnerZone />
            </main>
            <Footer />
            <BottomNav />
        </>
    );
}
