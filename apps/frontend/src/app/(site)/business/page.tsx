import { BusinessBenefits } from '@/components/business-benefits';
import { BusinessCTA } from '@/components/business-cta';
import { BusinessHero } from '@/components/business-hero';
import { BusinessHowItWorks } from '@/components/business-how-it-works';
export default function BusinessPage() {
  return <div className="relative min-h-screen overflow-hidden pb-20 pt-20">
    <div className="absolute inset-0 z-0 opacity-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0DA6A620_1px,transparent_1px),linear-gradient(to_bottom,#0DA6A620_1px,transparent_1px)] bg-[size:50px_50px]"></div>
    </div>
    <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#601F8C]/15 blur-[160px]"></div>
    <div className="absolute -right-20 top-1/2 h-[500px] w-[500px] rounded-full bg-[#1D04BF]/10 blur-[160px]"></div>

    <section className="relative z-10 pb-16 pt-24 lg:pb-24 lg:pt-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center">
          <BusinessHero />
        </div>
      </div>
    </section>

    <BusinessBenefits />
    <BusinessHowItWorks />
    <BusinessCTA />
  </div>;
}
