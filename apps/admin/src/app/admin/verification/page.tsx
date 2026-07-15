import { createAdminClient } from '@agroconnect/shared';

export default async function VerificationPage() {
  const supabase = await createAdminClient();
  const { data: pending } = await supabase
    .from('businesses')
    .select('id, business_name, business_type, business_phone, business_address, gps_address, registration_number, description, created_at, profiles!owner_id(full_name, email)')
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Seller Verification</h1>
      {pending && pending.length > 0 ? (
        <div className="grid gap-4">
          {pending.map((b: any) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                    {b.business_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.business_name}</h3>
                    <p className="text-sm capitalize text-gray-500">{b.business_type} — {b.business_address}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Phone: {b.business_phone || '—'}</span>
                      <span>Reg: {b.registration_number || '—'}</span>
                      {b.gps_address && <span>GPS: {b.gps_address}</span>}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Owner: {b.profiles?.full_name || 'Unknown'} ({b.profiles?.email})
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700">Approve</button>
                      <button className="rounded-lg border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Pending</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">All sellers verified</p>
        </div>
      )}
    </div>
  );
}
