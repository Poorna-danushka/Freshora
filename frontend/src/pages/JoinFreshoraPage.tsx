import { ArrowRight, Bike, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InfoCallout } from '@/components/onboarding/Callouts';
import deliveryRider from '@/assets/delivery_rider.png';
import heroProduce from '@/assets/hero_produce.png';

export function JoinFreshoraPage() {
  return (
    <div className="bg-white">
      <section className="container-app py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Join Freshora</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">Choose how you want to join Freshora</h1>
          <p className="text-lg text-gray-600">
            Whether you operate a store or want to deliver orders, Freshora has a dedicated onboarding process for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <article className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-primary-950">
              <img src={heroProduce} alt="Fresh produce ready for a store partner" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary-800">For local grocery stores</span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
                <Store size={18} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Store Partner</h2>
              <p className="font-medium text-gray-700 mb-4">Bring your store to Freshora</p>
              <ul className="text-sm text-gray-600 space-y-2 flex-1 mb-6">
                <li>Reach customers through the platform.</li>
                <li>Manage your store and products.</li>
                <li>Receive customer orders.</li>
                <li>Coordinate store operations.</li>
                <li>Add approved staff members.</li>
              </ul>
              <Link to="/join/store" className="btn-primary w-full justify-center">
                Apply as a Store Partner <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-primary-950">
              <img src={deliveryRider} alt="Delivery driver riding a motorbike" className="h-full w-full object-cover object-[center_35%] transition-transform duration-500 hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-amber-800">For delivery partners</span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Bike size={18} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Delivery Driver</h2>
              <p className="font-medium text-gray-700 mb-4">Deliver with Freshora</p>
              <ul className="text-sm text-gray-600 space-y-2 flex-1 mb-6">
                <li>Deliver orders from participating stores.</li>
                <li>Manage assigned deliveries.</li>
                <li>Work within supported delivery areas.</li>
                <li>Use a suitable delivery vehicle.</li>
                <li>Complete the required verification process.</li>
              </ul>
              <Link to="/join/driver" className="btn-primary w-full justify-center">
                Apply as a Driver <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        </div>

        <div className="mt-8">
          <InfoCallout>
            Store and driver applications are reviewed separately. Submitting an application does not automatically create an active partner account. Approval is required before access is granted.
          </InfoCallout>
        </div>
      </section>
    </div>
  );
}
