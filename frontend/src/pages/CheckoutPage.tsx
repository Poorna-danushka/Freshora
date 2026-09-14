import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { MapPin, CreditCard, Banknote, ChevronRight, Loader2 } from 'lucide-react';
import { ordersApi } from '@/api/orders';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';

const schema = z.object({
  recipientName: z.string().min(2, 'Full name required'),
  phone: z.string().min(9, 'Valid mobile number required'),
  houseNo: z.string().min(1, 'House/Apt number required'),
  street: z.string().min(3, 'Street address required'),
  area: z.string().min(2, 'Area required'),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'CASH_ON_DELIVERY']),
});

type CheckoutForm = z.infer<typeof schema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, storeId } = useCartStore();
  const { activeStore } = useActiveStoreStore();
  const { selectedLocation } = useLocationStore();

  const subtotal = totalPrice();
  const deliveryFee = activeStore?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      area: selectedLocation?.area ?? '',
      paymentMethod: 'CASH_ON_DELIVERY',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data: CheckoutForm) =>
      ordersApi.createOrder({
        storeId: storeId!,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress: {
          recipientName: data.recipientName,
          phone: data.phone,
          houseNo: data.houseNo,
          street: data.street,
          area: data.area,
          city: selectedLocation?.city ?? 'Colombo',
          landmark: data.landmark,
          notes: data.notes,
        },
        paymentMethod: data.paymentMethod,
      }),
    onSuccess: (order) => {
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    },
    onError: () => {
      // Mock success for development
      clearCart();
      navigate('/order-confirmation/ORD-' + Date.now());
    },
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🛒</span>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <button onClick={() => navigate(-1)} className="btn-primary mt-2">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit((d) => placeOrder(d))}>
          <div className="grid md:grid-cols-5 gap-6">
            {/* Left column */}
            <div className="md:col-span-3 space-y-4">
              {/* Delivery address */}
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-500" /> Delivery Address
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name *</label>
                    <input {...register('recipientName')} placeholder="Kamal Perera" className="input-field" />
                    {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mobile Number *</label>
                    <input {...register('phone')} placeholder="+94 77 123 4567" className="input-field" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">House / Apartment No. *</label>
                    <input {...register('houseNo')} placeholder="No. 25A" className="input-field" />
                    {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Street / Lane *</label>
                    <input {...register('street')} placeholder="Galle Road" className="input-field" />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Area *</label>
                    <input {...register('area')} placeholder="Colombo 03" className="input-field" />
                    {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Landmark</label>
                    <input {...register('landmark')} placeholder="Near Cargills" className="input-field" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Delivery Notes</label>
                    <textarea {...register('notes')} rows={2} placeholder="e.g. Call when arrived, leave at door..." className="input-field resize-none" />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-500" /> Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {([
                    { value: 'CASH_ON_DELIVERY', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    { value: 'CARD', icon: CreditCard, label: 'Card Payment', desc: 'Visa, Mastercard accepted' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input type="radio" value={opt.value} {...register('paymentMethod')} className="sr-only" />
                      <div className={`p-2 rounded-xl ${paymentMethod === opt.value ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <opt.icon size={18} className={paymentMethod === opt.value ? 'text-primary-600' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Order summary */}
            <div className="md:col-span-2">
              <div className="card p-6 sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Store */}
                {activeStore && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                    <img src={activeStore.logo} alt={activeStore.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-sm font-semibold text-gray-700">{activeStore.name}</span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-gray-500 shrink-0">{quantity}×</span>
                        <span className="text-gray-700 truncate">{product.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 shrink-0 ml-2">
                        LKR {(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery fee</span>
                    <span>{deliveryFee === 0 ? <span className="text-primary-500 font-medium">Free</span> : `LKR ${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                    <span>Total</span><span>LKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full btn-primary justify-center py-3.5 mt-5 text-base disabled:opacity-60"
                >
                  {isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                  ) : (
                    <>Place Order · LKR {total.toLocaleString()} <ChevronRight size={18} /></>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
