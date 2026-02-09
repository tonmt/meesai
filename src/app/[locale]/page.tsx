import HeroSection from '@/components/landing/HeroSection';
import BookingEngine from '@/components/landing/BookingEngine';
import OccasionNav from '@/components/landing/OccasionNav';
import HowItWorks from '@/components/landing/HowItWorks';
import DynamicFeed from '@/components/landing/DynamicFeed';
import TrustSection from '@/components/landing/TrustSection';
import OwnerZone from '@/components/landing/OwnerZone';
import Footer from '@/components/landing/Footer';
import MobileCTA from '@/components/landing/MobileCTA';
import { getFeedProducts, getCategories, getLandingStats } from '@/actions/products';

export default async function LandingPage() {
    const [products, categories, stats] = await Promise.all([
        getFeedProducts(),
        getCategories(),
        getLandingStats(),
    ]);

    return (
        <>
            <HeroSection stats={stats} />
            <BookingEngine />
            <OccasionNav />
            <HowItWorks />
            <DynamicFeed products={products} categories={categories} />
            <TrustSection />
            <OwnerZone />
            <Footer />
            <MobileCTA />
        </>
    );
}
