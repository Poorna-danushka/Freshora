import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Loader2, LogIn } from 'lucide-react';
import { applicationsApi } from '@/api/applications';
import { parseApiError } from '@/api/client';
import { ApplicationReviewSummary } from '@/components/onboarding/ApplicationReviewSummary';
import { InfoCallout, IntegrationNotice } from '@/components/onboarding/Callouts';
import { DocumentUploadField } from '@/components/onboarding/DocumentUploadField';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { DOCUMENT_TYPES, IMAGE_TYPES, phoneSchema, saveStoreSuccess, storeTypeLabel, validateUpload } from '@/lib/onboarding';
import { useAuthStore } from '@/store/useAuthStore';
import type { PreferredContactMethod, StoreType } from '@/types/applications';

const STEPS = ['Applicant', 'Store', 'Documents', 'Review', 'Submitted'];

const REQUIREMENTS = [
  'Your full name.',
  'A valid email address.',
  'A contact number.',
  "Your store's contact number.",
  'Store name.',
  'Store address.',
  'Store logo.',
  'Business registration number, where applicable.',
  'Business registration document or equivalent proof.',
  'Any relevant licenses or certificates required for your store type.',
  'Additional information requested during review.',
];

interface StoreFormState {
  applicantName: string;
  email: string;
  contactNumber: string;
  alternateContactNumber: string;
  preferredContactMethod: PreferredContactMethod;
  applicantNotes: string;
  storeName: string;
  storeContactNumber: string;
  storeEmail: string;
  storeAddress: string;
  city: string;
  province: string;
  postalCode: string;
  storeType: StoreType | '';
  registrationNumber: string;
  storeDescription: string;
  logo?: File;
  businessRegistration?: File;
  identityDocument?: File;
  license?: File;
  addressProof?: File;
  supportingDocument?: File;
  documentNotes: string;
  accurate: boolean;
  contactConsent: boolean;
  noGuarantee: boolean;
}

const initial: StoreFormState = {
  applicantName: '',
  email: '',
  contactNumber: '',
  alternateContactNumber: '',
  preferredContactMethod: 'PHONE',
  applicantNotes: '',
  storeName: '',
  storeContactNumber: '',
  storeEmail: '',
  storeAddress: '',
  city: '',
  province: '',
  postalCode: '',
  storeType: '',
  registrationNumber: '',
  storeDescription: '',
  documentNotes: '',
  accurate: false,
  contactConsent: false,
  noGuarantee: false,
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
      {error && <p id={`${id}-error`} className="text-sm text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  );
}

export function JoinStorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId') ?? undefined;
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StoreFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [requireLogin, setRequireLogin] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [loadingApplication, setLoadingApplication] = useState(Boolean(applicationId));

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    applicationsApi.getStoreApplication(applicationId).then((application) => {
      if (!active) return;
      if (application.status !== 'MORE_INFORMATION_REQUIRED') {
        setSubmitError('This application is not awaiting requested information.');
        setLoadingApplication(false);
        return;
      }
      setForm((previous) => ({
        ...previous,
        applicantName: application.applicantName,
        email: application.email,
        contactNumber: application.contactNumber,
        alternateContactNumber: application.alternateContactNumber ?? '',
        preferredContactMethod: application.preferredContactMethod,
        applicantNotes: application.applicantNotes ?? '',
        storeName: application.storeName,
        storeContactNumber: application.storeContactNumber,
        storeEmail: application.storeEmail ?? '',
        storeAddress: application.storeAddress,
        city: application.city,
        province: application.province ?? '',
        postalCode: application.postalCode ?? '',
        storeType: application.storeType,
        registrationNumber: application.registrationNumber ?? '',
        storeDescription: application.storeDescription ?? '',
        accurate: true,
        contactConsent: true,
        noGuarantee: true,
      }));
      setExistingDocuments(application.documents.map((document) => document.kind));
      setLoadingApplication(false);
    }).catch((error: unknown) => {
      if (!active) return;
      const { message } = parseApiError(error);
      setSubmitError(message || 'Could not load this application for updating.');
      setLoadingApplication(false);
    });
    return () => { active = false; };
  }, [applicationId]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        applicantName: prev.applicantName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const set = <K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const logoPreview = useMemo(() => (form.logo ? URL.createObjectURL(form.logo) : undefined), [form.logo]);

  const validateStep = (index: number) => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (form.applicantName.trim().length < 2) next.applicantName = 'Full name is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
      if (!phoneSchema.safeParse(form.contactNumber).success) next.contactNumber = 'Enter a valid contact number';
      if (form.alternateContactNumber && !phoneSchema.safeParse(form.alternateContactNumber).success) {
        next.alternateContactNumber = 'Enter a valid contact number';
      }
    }
    if (index === 1) {
      if (!form.storeName.trim()) next.storeName = 'Store name is required';
      if (!phoneSchema.safeParse(form.storeContactNumber).success) next.storeContactNumber = 'Enter a valid store contact number';
      if (form.storeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.storeEmail)) next.storeEmail = 'Enter a valid store email';
      if (!form.storeAddress.trim()) next.storeAddress = 'Store address is required';
      if (!form.city.trim()) next.city = 'City / town is required';
      if (!form.storeType) next.storeType = 'Select a store type';
      const logoError = validateUpload(form.logo, { required: !existingDocuments.includes('logo'), accept: IMAGE_TYPES, label: 'Store logo' });
      if (logoError) next.logo = logoError;
    }
    if (index === 2) {
      const br = validateUpload(form.businessRegistration, { required: !existingDocuments.includes('businessRegistration'), accept: DOCUMENT_TYPES, label: 'Business registration document' });
      const id = validateUpload(form.identityDocument, { required: !existingDocuments.includes('identityDocument'), accept: DOCUMENT_TYPES, label: 'Applicant identity document' });
      const license = validateUpload(form.license, { required: false, accept: DOCUMENT_TYPES, label: 'License/certificate' });
      const address = validateUpload(form.addressProof, { required: false, accept: DOCUMENT_TYPES, label: 'Proof of store address' });
      const extra = validateUpload(form.supportingDocument, { required: false, accept: DOCUMENT_TYPES, label: 'Supporting document' });
      if (br) next.businessRegistration = br;
      if (id) next.identityDocument = id;
      if (license) next.license = license;
      if (address) next.addressProof = address;
      if (extra) next.supportingDocument = extra;
    }
    if (index === 3) {
      if (!form.accurate) next.accurate = 'Please confirm the information is accurate';
      if (!form.contactConsent) next.contactConsent = 'Please confirm we may contact you';
      if (!form.noGuarantee) next.noGuarantee = 'Please confirm you understand approval is not guaranteed';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const submit = async () => {
    if (!validateStep(3) || !form.storeType || (!form.logo && !existingDocuments.includes('logo'))) return;

    if (!isAuthenticated) {
      setSubmitError('You must be logged in to submit a store partner application. Please log in or create an account, then try submitting again.');
      setRequireLogin(true);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setRequireLogin(false);
    try {
      const files: Record<string, File> = {};
      if (form.logo) files.logo = form.logo;
      if (form.businessRegistration) files.businessRegistration = form.businessRegistration;
      if (form.identityDocument) files.identityDocument = form.identityDocument;
      if (form.license) files.license = form.license;
      if (form.addressProof) files.addressProof = form.addressProof;
      if (form.supportingDocument) files.supportingDocument = form.supportingDocument;

      const result = await applicationsApi.submitStoreApplication({
        applicationId,
        applicantName: form.applicantName.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        alternateContactNumber: form.alternateContactNumber.trim() || undefined,
        preferredContactMethod: form.preferredContactMethod,
        applicantNotes: form.applicantNotes.trim() || undefined,
        storeName: form.storeName.trim(),
        storeContactNumber: form.storeContactNumber.trim(),
        storeEmail: form.storeEmail.trim() || undefined,
        storeAddress: form.storeAddress.trim(),
        city: form.city.trim(),
        province: form.province.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        storeType: form.storeType,
        registrationNumber: form.registrationNumber.trim() || undefined,
        storeDescription: form.storeDescription.trim() || undefined,
        files,
      });

      saveStoreSuccess({
        id: result.id,
        submittedAt: result.submittedAt,
        applicantName: form.applicantName.trim(),
        storeName: form.storeName.trim(),
        source: result.source,
      });
      navigate(applicationId ? '/my-applications' : '/join/store/success', { replace: true });
    } catch (err) {
      const { status, message } = parseApiError(err);
      if (status === 401) {
        setSubmitError('You must be logged in to submit a store application. Please log in and try again.');
        setRequireLogin(true);
      } else if (status === 409) {
        setSubmitError(message || 'A store application is already in progress for this account. Please contact Freshora if you need help.');
      } else {
        setSubmitError(message || 'We could not submit your application. Please check your form details and connection, then try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingApplication) {
    return <div className="container-app py-12 text-gray-600">Loading your application…</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Store partners</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Bring your store to Freshora</h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Join Freshora as a store partner and manage your products, orders, and store operations through one platform.
          </p>
        </div>
      </div>

      <div className="container-app py-10 max-w-4xl">
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What you’ll need</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {REQUIREMENTS.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">{item}</div>
            ))}
          </div>
          <InfoCallout>
            Document requirements may vary depending on the store type and applicable local requirements. Submitting an application does not automatically activate an account.
          </InfoCallout>
        </section>

        <OnboardingStepper steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4 card p-6">
            <Field id="applicantName" label="Full name" required error={errors.applicantName}>
              <input id="applicantName" className="input-field" value={form.applicantName} onChange={(e) => set('applicantName', e.target.value)} autoComplete="name" />
            </Field>
            <Field id="email" label="Email address" required error={errors.email} hint="We will use this email to contact you about your application.">
              <input id="email" type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="contactNumber" label="Personal contact number" required error={errors.contactNumber}>
                <input id="contactNumber" className="input-field" value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} autoComplete="tel" />
              </Field>
              <Field id="alternateContactNumber" label="Alternate contact number" error={errors.alternateContactNumber}>
                <input id="alternateContactNumber" className="input-field" value={form.alternateContactNumber} onChange={(e) => set('alternateContactNumber', e.target.value)} />
              </Field>
            </div>
            <Field id="preferredContactMethod" label="Preferred contact method" required>
              <select id="preferredContactMethod" className="input-field" value={form.preferredContactMethod} onChange={(e) => set('preferredContactMethod', e.target.value as PreferredContactMethod)}>
                <option value="PHONE">Phone</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </Field>
            <Field id="applicantNotes" label="Notes">
              <textarea id="applicantNotes" className="input-field min-h-24" value={form.applicantNotes} onChange={(e) => set('applicantNotes', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 card p-6">
            <Field id="storeName" label="Shop / store name" required error={errors.storeName}>
              <input id="storeName" className="input-field" value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="storeContactNumber" label="Store contact number" required error={errors.storeContactNumber}>
                <input id="storeContactNumber" className="input-field" value={form.storeContactNumber} onChange={(e) => set('storeContactNumber', e.target.value)} />
              </Field>
              <Field id="storeEmail" label="Store email" error={errors.storeEmail}>
                <input id="storeEmail" type="email" className="input-field" value={form.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} />
              </Field>
            </div>
            <Field id="storeAddress" label="Store address" required error={errors.storeAddress}>
              <input id="storeAddress" className="input-field" value={form.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field id="city" label="City / town" required error={errors.city}>
                <input id="city" className="input-field" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field id="province" label="Province / district">
                <input id="province" className="input-field" value={form.province} onChange={(e) => set('province', e.target.value)} />
              </Field>
              <Field id="postalCode" label="Postal code">
                <input id="postalCode" className="input-field" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
              </Field>
            </div>
            <Field id="storeType" label="Store type" required error={errors.storeType}>
              <select id="storeType" className="input-field" value={form.storeType} onChange={(e) => set('storeType', e.target.value as StoreType)}>
                <option value="">Select store type</option>
                <option value="GROCERY">Grocery store</option>
                <option value="FRESH_PRODUCE">Fresh produce store</option>
                <option value="SUPERMARKET">Supermarket</option>
                <option value="ORGANIC">Organic store</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field id="registrationNumber" label="Business registration number">
              <input id="registrationNumber" className="input-field" value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} />
            </Field>
            <Field id="storeDescription" label="Store description">
              <textarea id="storeDescription" className="input-field min-h-24" value={form.storeDescription} onChange={(e) => set('storeDescription', e.target.value)} />
            </Field>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Store logo <span className="text-red-500">*</span></p>
              <p className="text-xs text-gray-400 mb-3">Upload a clear store logo. Accepted formats: JPG, PNG, WEBP. Maximum file size: 5 MB.</p>
              {logoPreview && (
                <img src={logoPreview} alt="Store logo preview" className="w-24 h-24 rounded-2xl object-cover border border-gray-200 mb-3" />
              )}
              <DocumentUploadField
                id="logo"
                label="Store logo"
                required
                acceptImagesOnly
                previewAsImage
                file={form.logo}
                error={errors.logo}
                onChange={(file) => set('logo', file)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <InfoCallout>
              Please upload clear, valid documents. Freshora may request additional information during the review process.
            </InfoCallout>
            <DocumentUploadField id="businessRegistration" label="Business registration document" required file={form.businessRegistration} error={errors.businessRegistration} onChange={(file) => set('businessRegistration', file)} />
            <DocumentUploadField id="identityDocument" label="Applicant identity document" required file={form.identityDocument} error={errors.identityDocument} onChange={(file) => set('identityDocument', file)} />
            <DocumentUploadField id="license" label="Relevant license or certificate" file={form.license} error={errors.license} onChange={(file) => set('license', file)} description="Upload only if applicable to your store type." />
            <DocumentUploadField id="addressProof" label="Proof of store address" file={form.addressProof} error={errors.addressProof} onChange={(file) => set('addressProof', file)} />
            <DocumentUploadField id="supportingDocument" label="Additional supporting document" file={form.supportingDocument} error={errors.supportingDocument} onChange={(file) => set('supportingDocument', file)} />
            <Field id="documentNotes" label="Additional notes">
              <textarea id="documentNotes" className="input-field min-h-24" value={form.documentNotes} onChange={(e) => set('documentNotes', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <ApplicationReviewSummary
              sections={[
                {
                  title: 'Applicant details',
                  onEdit: () => setStep(0),
                  rows: [
                    { label: 'Full name', value: form.applicantName },
                    { label: 'Email', value: form.email },
                    { label: 'Personal contact', value: form.contactNumber },
                    { label: 'Alternate contact', value: form.alternateContactNumber },
                    { label: 'Preferred contact', value: form.preferredContactMethod },
                    { label: 'Notes', value: form.applicantNotes },
                  ],
                },
                {
                  title: 'Store details',
                  onEdit: () => setStep(1),
                  rows: [
                    { label: 'Store name', value: form.storeName },
                    { label: 'Store contact', value: form.storeContactNumber },
                    { label: 'Store email', value: form.storeEmail },
                    { label: 'Address', value: `${form.storeAddress}, ${form.city}` },
                    { label: 'Province', value: form.province },
                    { label: 'Postal code', value: form.postalCode },
                    { label: 'Store type', value: form.storeType ? storeTypeLabel(form.storeType) : '' },
                    { label: 'Registration number', value: form.registrationNumber },
                    { label: 'Logo', value: form.logo?.name },
                  ],
                },
                {
                  title: 'Uploaded documents',
                  onEdit: () => setStep(2),
                  rows: [
                    { label: 'Business registration', value: form.businessRegistration?.name },
                    { label: 'Identity document', value: form.identityDocument?.name },
                    { label: 'License/certificate', value: form.license?.name },
                    { label: 'Address proof', value: form.addressProof?.name },
                    { label: 'Supporting document', value: form.supportingDocument?.name },
                    { label: 'Document notes', value: form.documentNotes },
                  ],
                },
              ]}
            />
            <div className="card p-6 space-y-3">
              <h3 className="font-bold text-gray-900">Agreements</h3>
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={form.accurate} onChange={(e) => set('accurate', e.target.checked)} className="mt-1" />
                I confirm that the information provided is accurate.
              </label>
              {errors.accurate && <p className="text-sm text-red-600" role="alert">{errors.accurate}</p>}
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={form.contactConsent} onChange={(e) => set('contactConsent', e.target.checked)} className="mt-1" />
                I agree that Freshora may contact me regarding this application.
              </label>
              {errors.contactConsent && <p className="text-sm text-red-600" role="alert">{errors.contactConsent}</p>}
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={form.noGuarantee} onChange={(e) => set('noGuarantee', e.target.checked)} className="mt-1" />
                I understand that submitting this application does not guarantee approval.
              </label>
              {errors.noGuarantee && <p className="text-sm text-red-600" role="alert">{errors.noGuarantee}</p>}
            </div>
            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" role="alert">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
                {(requireLogin || !isAuthenticated) && (
                  <Link
                    to="/login?redirect=/join/store"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shrink-0"
                  >
                    <LogIn size={14} /> Log In Now
                  </Link>
                )}
              </div>
            )}
            <IntegrationNotice>
              Your application and uploaded files will be securely submitted to Freshora for review. Submitting an application does not automatically activate a store account — a Freshora team member will review your application and contact you with their decision.
            </IntegrationNotice>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {step > 0 && (
            <button type="button" className="btn-secondary w-full sm:w-auto justify-center" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="btn-primary w-full sm:ml-auto justify-center" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button type="button" disabled={submitting} className="btn-primary w-full sm:ml-auto justify-center disabled:opacity-60" onClick={submit}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
