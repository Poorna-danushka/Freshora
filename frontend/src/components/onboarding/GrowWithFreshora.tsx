import { ArrowRight, Bike, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GrowWithFreshora() {
  const cards = [
    {
      icon: ShoppingBag,
      title: 'Shop as a customer',
      points: [
        'Browse fresh products.',
        'Discover participating stores.',
        'Add products to your cart.',
        'Place orders.',
        'Track your delivery.',
      ],
      cta: 'Start Shopping',
      to: '/signup',
      accent: 'from-emerald-50 to-white border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Store,
      title: 'Join as a store partner',
      points: [
        'Bring your store online.',
        'Reach Freshora customers.',
        'Manage products and inventory.',
        'Receive and manage orders.',
        'Work with Freshora delivery operations.',
        'Add approved store staff to help operate your store.',
      ],
      cta: 'Become a Store Partner',
      to: '/join/store',
      accent: 'from-lime-50 to-white border-lime-100',
      iconBg: 'bg-lime-100 text-lime-700',
    },
    {
      icon: Bike,
      title: 'Join as a delivery driver',
      points: [
        'Deliver orders from participating stores.',
        'Receive delivery assignments.',
        'Manage delivery status.',
        'Work within supported service areas.',
        'Use a suitable vehicle for delivery operations.',
      ],
      cta: 'Become a Delivery Driver',
      to: '/join/driver',
      accent: 'from-amber-50 to-white border-amber-100',
      iconBg: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-app">
        <div className="max-w-3xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Grow with Freshora</p>
          <h2 className="section-title mt-2">A platform for customers, local stores, and delivery partners.</h2>
          <p className="section-subtitle">
            Freshora connects customers with participating stores and delivery partners through one coordinated platform.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <article key={card.title} className={`rounded-3xl border bg-gradient-to-b ${card.accent} p-6 flex flex-col shadow-sm`}>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <card.icon size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
              <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link to={card.to} className="btn-primary w-full justify-center">
                {card.cta} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
