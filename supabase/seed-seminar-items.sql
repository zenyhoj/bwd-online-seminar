insert into public.seminar_items (
  organization_id,
  title,
  description,
  media_type,
  media_url,
  display_order,
  is_active
)
select
  o.id,
  seed.title,
  seed.description,
  seed.media_type,
  seed.media_url,
  seed.display_order,
  true
from public.organizations o
cross join (
  values
    (
      'Water Service Orientation',
      'Introduce applicants to the public water service process, service coverage expectations, connection policies, and the overall step-by-step application journey before field processing begins.',
      'text',
      null,
      1
    ),
    (
      'Document Requirements',
      'Explain the required supporting documents, acceptable proof of ownership or authority, and the need to submit complete and readable files before verification can move forward.',
      'text',
      null,
      2
    ),
    (
      'Inhouse Installation Guidelines',
      'Walk applicants through proper inhouse plumbing preparation, the importance of using accredited plumbers when required, and the need to finish installation work before final processing milestones.',
      'text',
      null,
      3
    ),
    (
      'Inspection and Payment Process',
      'Describe scheduling, field inspection expectations, payment notices, and the approval-to-connection flow so applicants understand what happens after their information is submitted.',
      'text',
      null,
      4
    )
) as seed(title, description, media_type, media_url, display_order)
where not exists (
  select 1
  from public.seminar_items existing
  where existing.organization_id = o.id
    and existing.title = seed.title
);
