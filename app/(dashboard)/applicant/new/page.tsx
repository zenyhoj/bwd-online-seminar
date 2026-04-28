import { ApplicantForm } from "@/components/applicant/applicant-form";

export default function NewApplicantPage() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Add New Applicant</h1>
        <p className="text-muted-foreground">
          Create a new applicant record to start managing their seminar and application process.
        </p>
      </div>
      
      <ApplicantForm />
    </div>
  );
}
