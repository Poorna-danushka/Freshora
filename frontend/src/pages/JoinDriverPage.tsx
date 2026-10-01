import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { applicationsApi } from '@/api/applications';
import { parseApiError } from '@/api/client';
import { ApplicationReviewSummary } from '@/components/onboarding/ApplicationReviewSummary';
import { InfoCallout, IntegrationNotice } from '@/components/onboarding/Callouts';
import { DocumentUploadField } from '@/components/onboarding/DocumentUploadField';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { DOCUMENT_TYPES, IMAGE_TYPES, ownershipLabel, phoneSchema, saveDriverSuccess, validateUpload, vehicleTypeLabel } from '@/lib/onboarding';
import type { VehicleOwnership, VehicleType } from '@/types/applications';

const STEPS = ['Personal', 'Vehicle', 'Documents', 'Availability', 'Review', 'Submitted'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DriverFormState {
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  photo?: File;
  vehicleType: VehicleType | '';
  vehicleRegistrationNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  ownershipType: VehicleOwnership | '';
  vehicleRegistrationDoc?: File;
  vehicleInsuranceDoc?: File;
  revenueLicense?: File;
  identityDocument?: File;
  licenseFront?: File;
  licenseBack?: File;
  additionalDocument?: File;
  documentNotes: string;
  preferredArea: string;
  preferredWorkingDays: string[];
  preferredWorkingHours: string;
  deliveryExperience: string;
  hasSmartphone: '' | 'yes' | 'no';
  hasDeliveryBag: '' | 'yes' | 'no';
  additionalNotes: string;
  accurate: boolean;
  contactConsent: boolean;
  approvalRequired: boolean;
  maintainDocuments: boolean;
}

const initial: DriverFormState = {
  fullName: '',
  email: '',
  contactNumber: '',
  dateOfBirth: '',
  address: '',
  city: '',
  province: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  vehicleType: '',
  vehicleRegistrationNumber: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleColor: '',
  ownershipType: '',
  documentNotes: '',
  preferredArea: '',
  preferredWorkingDays: [],
  preferredWorkingHours: '',
  deliveryExperience: '',
  hasSmartphone: '',
  hasDeliveryBag: '',
  additionalNotes: '',
  accurate: false,
  contactConsent: false,
  approvalRequired: false,
  maintainDocuments: false,
};

function Field({
  id, label, required, hint, error, children,
}: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-medium">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-sm text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  );
}

export function JoinDriverPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DriverFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = <K extends keyof DriverFormState>(key: K, value: DriverFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[String(key)];
      return next;
    });
  };

  const photoPreview = useMemo(() => (form.photo ? URL.createObjectURL(form.photo) : undefined), [form.photo]);

  const validateStep = (index: number) => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (form.fullName.trim().length < 2) next.fullName = 'Full name is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
      if (!phoneSchema.safeParse(form.contactNumber).success) next.contactNumber = 'Enter a valid contact number';
      if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required';
      if (!form.address.trim()) next.address = 'Residential address is required';
      if (!form.city.trim()) next.city = 'City / town is required';
      if (form.emergencyContactNumber && !phoneSchema.safeParse(form.emergencyContactNumber).success) {
        next.emergencyContactNumber = 'Enter a valid contact number';
      }
      const photoError = validateUpload(form.photo, { required: true, accept: IMAGE_TYPES, label: 'Driver profile photo' });
      if (photoError) next.photo = photoError;
    }
    if (index === 1) {
      if (!form.vehicleType) next.vehicleType = 'Select a vehicle type';
      if (!form.vehicleRegistrationNumber.trim()) next.vehicleRegistrationNumber = 'Vehicle registration number is required';
      if (!form.ownershipType) next.ownershipType = 'Select vehicle ownership type';
      const reg = validateUpload(form.vehicleRegistrationDoc, { required: true, accept: DOCUMENT_TYPES, label: 'Vehicle registration document' });
      const ins = validateUpload(form.vehicleInsuranceDoc, { required: false, accept: DOCUMENT_TYPES, label: 'Vehicle insurance document' });
      const rev = validateUpload(form.revenueLicense, { required: false, accept: DOCUMENT_TYPES, label: 'Revenue license' });
      if (reg) next.vehicleRegistrationDoc = reg;
      if (ins) next.vehicleInsuranceDoc = ins;
      if (rev) next.revenueLicense = rev;
    }
    if (index === 2) {
      const id = validateUpload(form.identityDocument, { required: true, accept: DOCUMENT_TYPES, label: 'Identity document' });
      const front = validateUpload(form.licenseFront, { required: true, accept: DOCUMENT_TYPES, label: 'Driving license (front)' });
      const back = validateUpload(form.licenseBack, { required: false, accept: DOCUMENT_TYPES, label: 'Driving license (back)' });
      const extra = validateUpload(form.additionalDocument, { required: false, accept: DOCUMENT_TYPES, label: 'Additional document' });
      if (id) next.identityDocument = id;
      if (front) next.licenseFront = front;
      if (back) next.licenseBack = back;
      if (extra) next.additionalDocument = extra;
    }
    if (index === 3) {
      if (!form.preferredArea.trim()) next.preferredArea = 'Preferred delivery area is required';
      if (form.hasSmartphone !== 'yes' && form.hasSmartphone !== 'no') next.hasSmartphone = 'Please answer this question';
    }
    if (index === 4) {
      if (!form.accurate) next.accurate = 'Please confirm the information is accurate';
      if (!form.contactConsent) next.contactConsent = 'Please confirm we may contact you';
      if (!form.approvalRequired) next.approvalRequired = 'Please confirm you understand approval is required';
      if (!form.maintainDocuments) next.maintainDocuments = 'Please confirm you will maintain valid documents';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validateStep(4) || !form.vehicleType || !form.ownershipType) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const files: Record<string, File> = {};
      if (form.photo) files.photo = form.photo;
      if (form.vehicleRegistrationDoc) files.vehicleRegistrationDoc = form.vehicleRegistrationDoc;
      if (form.vehicleInsuranceDoc) files.vehicleInsuranceDoc = form.vehicleInsuranceDoc;
      if (form.revenueLicense) files.revenueLicense = form.revenueLicense;
      if (form.identityDocument) files.identityDocument = form.identityDocument;
      if (form.licenseFront) files.licenseFront = form.licenseFront;
      if (form.licenseBack) files.licenseBack = form.licenseBack;
      if (form.additionalDocument) files.additionalDocument = form.additionalDocument;

      const result = await applicationsApi.submitDriverApplication({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province.trim() || undefined,
        emergencyContactName: form.emergencyContactName.trim() || undefined,
        emergencyContactNumber: form.emergencyContactNumber.trim() || undefined,
        vehicleType: form.vehicleType,
        vehicleRegistrationNumber: form.vehicleRegistrationNumber.trim(),
        vehicleMake: form.vehicleMake.trim() || undefined,
        vehicleModel: form.vehicleModel.trim() || undefined,
        vehicleYear: form.vehicleYear.trim() || undefined,
        vehicleColor: form.vehicleColor.trim() || undefined,
        ownershipType: form.ownershipType,
        preferredArea: form.preferredArea.trim(),
        preferredWorkingDays: form.preferredWorkingDays,
        preferredWorkingHours: form.preferredWorkingHours.trim() || undefined,
        deliveryExperience: form.deliveryExperience.trim() || undefined,
        hasSmartphone: form.hasSmartphone === 'yes',
        hasDeliveryBag: form.hasDeliveryBag === '' ? undefined : form.hasDeliveryBag === 'yes',
        additionalNotes: form.additionalNotes.trim() || form.documentNotes.trim() || undefined,
        files,
      });

      saveDriverSuccess({
        id: result.id,
        submittedAt: result.submittedAt,
        applicantName: form.fullName.trim(),
        vehicleType: form.vehicleType,
        source: result.source,
      });
      navigate('/join/driver/success', { replace: true });
    } catch (err) {
      const { status, message } = parseApiError(err);
      if (status === 401) {
        setSubmitError('You must be logged in to submit a driver application. Please log in and try again.');
      } else if (status === 409) {
        setSubmitError(message || 'A driver application is already in progress for this account. Please contact Freshora if you need help.');
      } else {
        setSubmitError(message || 'We could not submit your application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Delivery partners</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Deliver with Freshora</h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Help deliver orders from participating stores to customers using a suitable vehicle and the Freshora delivery system.
          </p>
          <div className="mt-5 max-w-3xl">
            <InfoCallout>
              Freshora is initially focusing on motorbikes and three-wheelers for local delivery operations. Vehicle availability and eligibility may depend on the service area and operational requirements.
            </InfoCallout>
          </div>
        </div>
      </div>

      <div className="container-app py-10 max-w-4xl">
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What you’ll need</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
            {[
              'Full name.',
              'Email address.',
              'Contact number.',
              'Date of birth.',
              'Residential address.',
              'Valid driving license.',
              'Vehicle information.',
              'Vehicle registration documents.',
              'Insurance or other relevant vehicle documents, where applicable.',
              'Identity document.',
              'Driver profile photo.',
              'Additional documents requested during review.',
            ].map((item) => (
              <li key={item} className="rounded-2xl border border-gray-100 bg-white px-4 py-3">{item}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">Required documents may vary depending on the vehicle type, service area, and applicable requirements.</p>
        </section>

        <OnboardingStepper steps={STEPS} current={step} />

        {step === 0 && (
          <div className="card p-6 space-y-4">
            <Field id="fullName" label="Full name" required error={errors.fullName}>
              <input id="fullName" className="input-field" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
            </Field>
            <Field id="email" label="Email address" required error={errors.email}>
              <input id="email" type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="contactNumber" label="Contact number" required error={errors.contactNumber}>
                <input id="contactNumber" className="input-field" value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} />
              </Field>
              <Field id="dateOfBirth" label="Date of birth" required error={errors.dateOfBirth}>
                <input id="dateOfBirth" type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </Field>
            </div>
            <Field id="address" label="Residential address" required error={errors.address}>
              <input id="address" className="input-field" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="city" label="City / town" required error={errors.city}>
                <input id="city" className="input-field" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field id="province" label="Province / district">
                <input id="province" className="input-field" value={form.province} onChange={(e) => set('province', e.target.value)} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="emergencyContactName" label="Emergency contact name">
                <input id="emergencyContactName" className="input-field" value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
              </Field>
              <Field id="emergencyContactNumber" label="Emergency contact number" error={errors.emergencyContactNumber}>
                <input id="emergencyContactNumber" className="input-field" value={form.emergencyContactNumber} onChange={(e) => set('emergencyContactNumber', e.target.value)} />
              </Field>
            </div>
            {photoPreview && <img src={photoPreview} alt="Driver photo preview" className="w-24 h-24 rounded-2xl object-cover border" />}
            <DocumentUploadField id="photo" label="Driver profile photo" required acceptImagesOnly previewAsImage file={form.photo} error={errors.photo} onChange={(file) => set('photo', file)} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="card p-6 space-y-4">
              <Field id="vehicleType" label="Vehicle type" required error={errors.vehicleType} hint="Motorbikes and three-wheelers are the current focus for local grocery delivery.">
                <select id="vehicleType" className="input-field" value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value as VehicleType)}>
                  <option value="">Select vehicle type</option>
                  <option value="MOTORBIKE">Motorbike</option>
                  <option value="THREE_WHEELER">Three-wheeler</option>
                  <option value="OTHER">Other — only if later supported</option>
                </select>
              </Field>
              {form.vehicleType === 'OTHER' && (
                <InfoCallout>
                  Other vehicle types are not the current operational focus. Eligibility may be limited by service area and operational requirements.
                </InfoCallout>
              )}
              <Field id="vehicleRegistrationNumber" label="Vehicle registration number" required error={errors.vehicleRegistrationNumber}>
                <input id="vehicleRegistrationNumber" className="input-field" value={form.vehicleRegistrationNumber} onChange={(e) => set('vehicleRegistrationNumber', e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="vehicleMake" label="Vehicle make">
                  <input id="vehicleMake" className="input-field" value={form.vehicleMake} onChange={(e) => set('vehicleMake', e.target.value)} />
                </Field>
                <Field id="vehicleModel" label="Vehicle model">
                  <input id="vehicleModel" className="input-field" value={form.vehicleModel} onChange={(e) => set('vehicleModel', e.target.value)} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="vehicleYear" label="Vehicle year">
                  <input id="vehicleYear" className="input-field" value={form.vehicleYear} onChange={(e) => set('vehicleYear', e.target.value)} />
                </Field>
                <Field id="vehicleColor" label="Vehicle color">
                  <input id="vehicleColor" className="input-field" value={form.vehicleColor} onChange={(e) => set('vehicleColor', e.target.value)} />
                </Field>
              </div>
              <Field id="ownershipType" label="Vehicle ownership type" required error={errors.ownershipType}>
                <select id="ownershipType" className="input-field" value={form.ownershipType} onChange={(e) => set('ownershipType', e.target.value as VehicleOwnership)}>
                  <option value="">Select ownership</option>
                  <option value="OWN">Own vehicle</option>
                  <option value="FAMILY">Family vehicle</option>
                  <option value="RENTED">Rented/leased vehicle</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
            </div>
            <DocumentUploadField id="vehicleRegistrationDoc" label="Vehicle registration document" required file={form.vehicleRegistrationDoc} error={errors.vehicleRegistrationDoc} onChange={(file) => set('vehicleRegistrationDoc', file)} />
            <DocumentUploadField id="vehicleInsuranceDoc" label="Vehicle insurance document" file={form.vehicleInsuranceDoc} error={errors.vehicleInsuranceDoc} onChange={(file) => set('vehicleInsuranceDoc', file)} description="Upload if applicable." />
            <DocumentUploadField id="revenueLicense" label="Revenue license or other relevant document" file={form.revenueLicense} error={errors.revenueLicense} onChange={(file) => set('revenueLicense', file)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <InfoCallout>Please upload clear, valid documents. Freshora may request additional information during the review process.</InfoCallout>
            <DocumentUploadField id="identityDocument" label="Identity document" required file={form.identityDocument} error={errors.identityDocument} onChange={(file) => set('identityDocument', file)} />
            <DocumentUploadField id="licenseFront" label="Driving license image — front" required file={form.licenseFront} error={errors.licenseFront} onChange={(file) => set('licenseFront', file)} />
            <DocumentUploadField id="licenseBack" label="Driving license image — back" file={form.licenseBack} error={errors.licenseBack} onChange={(file) => set('licenseBack', file)} />
            <p className="text-sm text-gray-500">Vehicle registration was captured in the previous step. You can go back to replace it.</p>
            <DocumentUploadField id="additionalDocument" label="Additional supporting document" file={form.additionalDocument} error={errors.additionalDocument} onChange={(file) => set('additionalDocument', file)} />
            <Field id="documentNotes" label="Additional notes">
              <textarea id="documentNotes" className="input-field min-h-24" value={form.documentNotes} onChange={(e) => set('documentNotes', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="card p-6 space-y-4">
            <Field id="preferredArea" label="Preferred delivery area / city" required error={errors.preferredArea}>
              <input id="preferredArea" className="input-field" value={form.preferredArea} onChange={(e) => set('preferredArea', e.target.value)} />
            </Field>
            <fieldset>
              <legend className="text-sm font-semibold text-gray-800 mb-2">Preferred working days</legend>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <label key={day} className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${form.preferredWorkingDays.includes(day) ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white'}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.preferredWorkingDays.includes(day)}
                      onChange={(e) => {
                        set('preferredWorkingDays', e.target.checked
                          ? [...form.preferredWorkingDays, day]
                          : form.preferredWorkingDays.filter((d) => d !== day));
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field id="preferredWorkingHours" label="Preferred working hours">
              <input id="preferredWorkingHours" className="input-field" placeholder="e.g. 08:00–18:00" value={form.preferredWorkingHours} onChange={(e) => set('preferredWorkingHours', e.target.value)} />
            </Field>
            <Field id="deliveryExperience" label="Delivery experience">
              <textarea id="deliveryExperience" className="input-field min-h-24" value={form.deliveryExperience} onChange={(e) => set('deliveryExperience', e.target.value)} />
            </Field>
            <Field id="hasSmartphone" label="Do you have a smartphone suitable for using the driver application?" required error={errors.hasSmartphone}>
              <select id="hasSmartphone" className="input-field" value={form.hasSmartphone} onChange={(e) => set('hasSmartphone', e.target.value as DriverFormState['hasSmartphone'])}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field id="hasDeliveryBag" label="Do you have a delivery bag or suitable carrying equipment?">
              <select id="hasDeliveryBag" className="input-field" value={form.hasDeliveryBag} onChange={(e) => set('hasDeliveryBag', e.target.value as DriverFormState['hasDeliveryBag'])}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field id="additionalNotes" label="Additional notes">
              <textarea id="additionalNotes" className="input-field min-h-24" value={form.additionalNotes} onChange={(e) => set('additionalNotes', e.target.value)} />
            </Field>
            <p className="text-xs text-gray-400">Freshora does not promise earnings, guaranteed order volume, or guaranteed working hours.</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <ApplicationReviewSummary
              sections={[
                {
                  title: 'Personal information',
                  onEdit: () => setStep(0),
                  rows: [
                    { label: 'Full name', value: form.fullName },
                    { label: 'Email', value: form.email },
                    { label: 'Contact', value: form.contactNumber },
                    { label: 'Date of birth', value: form.dateOfBirth },
                    { label: 'Address', value: `${form.address}, ${form.city}` },
                    { label: 'Photo', value: form.photo?.name },
                  ],
                },
                {
                  title: 'Vehicle information',
                  onEdit: () => setStep(1),
                  rows: [
                    { label: 'Vehicle type', value: form.vehicleType ? vehicleTypeLabel(form.vehicleType) : '' },
                    { label: 'Registration number', value: form.vehicleRegistrationNumber },
                    { label: 'Make / model', value: [form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ') },
                    { label: 'Ownership', value: form.ownershipType ? ownershipLabel(form.ownershipType) : '' },
                    { label: 'Registration document', value: form.vehicleRegistrationDoc?.name },
                    { label: 'Insurance', value: form.vehicleInsuranceDoc?.name },
                  ],
                },
                {
                  title: 'Documents',
                  onEdit: () => setStep(2),
                  rows: [
                    { label: 'Identity document', value: form.identityDocument?.name },
                    { label: 'License front', value: form.licenseFront?.name },
                    { label: 'License back', value: form.licenseBack?.name },
                    { label: 'Additional document', value: form.additionalDocument?.name },
                  ],
                },
                {
                  title: 'Availability',
                  onEdit: () => setStep(3),
                  rows: [
                    { label: 'Preferred area', value: form.preferredArea },
                    { label: 'Working days', value: form.preferredWorkingDays.join(', ') },
                    { label: 'Working hours', value: form.preferredWorkingHours },
                    { label: 'Smartphone', value: form.hasSmartphone },
                    { label: 'Delivery bag', value: form.hasDeliveryBag },
                  ],
                },
              ]}
            />
            <div className="card p-6 space-y-3">
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={form.accurate} onChange={(e) => set('accurate', e.target.checked)} /> I confirm that the information provided is accurate.</label>
              {errors.accurate && <p className="text-sm text-red-600">{errors.accurate}</p>}
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={form.contactConsent} onChange={(e) => set('contactConsent', e.target.checked)} /> I agree that Freshora may contact me regarding this application.</label>
              {errors.contactConsent && <p className="text-sm text-red-600">{errors.contactConsent}</p>}
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={form.approvalRequired} onChange={(e) => set('approvalRequired', e.target.checked)} /> I understand that approval is required before I can access delivery operations.</label>
              {errors.approvalRequired && <p className="text-sm text-red-600">{errors.approvalRequired}</p>}
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={form.maintainDocuments} onChange={(e) => set('maintainDocuments', e.target.checked)} /> I understand that I must maintain valid documents required for my vehicle and driving activities.</label>
              {errors.maintainDocuments && <p className="text-sm text-red-600">{errors.maintainDocuments}</p>}
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <IntegrationNotice>
              Your application and uploaded files will be securely submitted to Freshora for review. Submitting an application does not automatically activate a driver account — a Freshora team member will review your application and contact you with their decision.
            </IntegrationNotice>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {step > 0 && (
            <button type="button" className="btn-secondary w-full sm:w-auto justify-center" onClick={() => setStep((s) => s - 1)}>Back</button>
          )}
          {step < 4 ? (
            <button type="button" className="btn-primary w-full sm:ml-auto justify-center" onClick={() => validateStep(step) && setStep((s) => s + 1)}>Continue</button>
          ) : (
            <button type="button" disabled={submitting} className="btn-primary w-full sm:ml-auto justify-center disabled:opacity-60" onClick={submit}>
              {submitting ? <><Loader2 className="animate-spin" size={16} /> Submitting...</> : 'Submit Driver Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
