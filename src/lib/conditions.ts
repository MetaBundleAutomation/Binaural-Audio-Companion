// Condition content for the CRUX Wheel "Conditions" area.
//
// SNAPSHOT / PROVENANCE
// ---------------------
// This content is a point-in-time copy, taken on the date below, of the
// condition pages in Les's Community Treatment Platform (CTP) app. CTP is where
// this medical content is being written and reviewed by the partner doctor.
//
// Because it is a COPY, the doctor's edits in CTP do NOT flow here
// automatically. This is deliberate for the mock-up (a self-contained thing to
// show the doctor), but it means the two can drift. Whether CRUX and CTP should
// share one source of truth is a later decision — see docs/handover.md.
//
// DRAFT: none of this is clinically reviewed. It is shown DRAFT, for doctor
// review, and must not go to the live site without a named clinical reviewer.
// `lastReviewed` is left unset on every condition; only set it, per condition,
// once the doctor has actually signed that condition off (never claim a review
// that has not happened).
//
// CONTENT RULES carried over from CTP (honour these when editing):
//   - The condition is "Alcohol & Drug Use". The word "addiction" must never
//     appear in anything a reader sees, including the web address.
//   - Australian spelling throughout.
//   - Key points only restate what is already on the page; never a new claim.
//   - Each audience's content uses only that audience's own text.
//
// Four-level evidence scale, kept faithful to CTP (richer than the wheel's own
// three-level scale, on purpose — the clinician view needs the distinctions).

export const CONDITIONS_SOURCE_APP = "Community Treatment Platform";
export const CONDITIONS_SNAPSHOT = "16 November 2026";

export type ConditionEvidence =
  | "strong"
  | "promising"
  | "traditional"
  | "anecdotal";

export const CONDITION_EVIDENCE_META: Record<
  ConditionEvidence,
  { label: string; dot: string; note: string }
> = {
  // Dot carries the level; the words carry the meaning, so the badge never
  // relies on colour alone.
  strong: {
    label: "Strong clinical evidence",
    dot: "var(--accent-2)",
    note: "Backed by strong, consistent clinical research",
  },
  promising: {
    label: "Promising evidence",
    dot: "#F0A830",
    note: "Promising, but still developing or mixed",
  },
  traditional: {
    label: "Traditional / consensus use",
    dot: "var(--text-secondary)",
    note: "Based on expert consensus rather than trials",
  },
  anecdotal: {
    label: "Anecdotal",
    dot: "var(--text-secondary)",
    note: "Reports and experience, not yet tested in trials",
  },
};

export interface ConditionSource {
  label: string;
  href?: string;
}

/** One block of body content inside a section. */
export type ContentBlock =
  | { p: string }
  | { list: string[] }
  | { defs: { term: string; text: string }[] };

export interface ConditionSection {
  heading: string;
  evidence?: ConditionEvidence;
  /** A highlighted left-border callout: "amber" for emphasis, "brick" for a risk. */
  callout?: "amber" | "brick";
  blocks: ContentBlock[];
}

export interface AudienceContent {
  /** A lead paragraph shown above the sections (patient views have one). */
  intro?: string;
  sections: ConditionSection[];
}

export interface Condition {
  /** URL-safe id: /explore/conditions/<slug>. Never contains "addiction". */
  slug: string;
  name: string;
  /** One line on the index card. */
  description: string;
  /** Only set once the doctor has signed this condition off. */
  lastReviewed?: string;
  keyPoints: {
    clinician: string[];
    veteran: string[];
    firstResponder: string[];
  };
  clinician: AudienceContent;
  veteran: AudienceContent;
  firstResponder: AudienceContent;
  /** Ported from each page's References list; href where CTP confirms a link. */
  sources: ConditionSource[];
  /** Other conditions this one cross-references. */
  related?: string[];
  /** Gentle links from a diagnosis into the wheel's self-help spokes. */
  relatedSpokes?: { id: string; text: string }[];
}

const ptsd: Condition = {
  slug: "ptsd",
  name: "PTSD",
  description:
    "Trauma-focused therapy, medication and support after traumatic events.",
  clinician: {
    sections: [
      {
        heading: "First-line treatment",
        evidence: "strong",
        blocks: [
          {
            p: "The Phoenix Australia Guidelines (NHMRC-approved) recommend trauma-focused psychological therapies as first-line treatment for adult PTSD, ahead of medication. Prolonged exposure (PE), cognitive processing therapy (CPT), trauma-focused CBT, and EMDR (Eye Movement Desensitisation and Reprocessing) all carry strong recommendations at the same tier — none is positioned as superior to the others, and choice can reasonably be guided by patient preference and therapist availability. EMDR uses bilateral stimulation (typically guided eye movements) while the patient recalls the traumatic memory, and has a different proposed mechanism to exposure-based approaches, but comparable outcomes in head-to-head trials. Where these aren't available or acceptable, guided internet-based trauma-focused CBT, present-centred therapy, or group trauma-focused CBT are conditionally recommended alternatives.",
          },
        ],
      },
      {
        heading: "Second-line: pharmacological options",
        evidence: "promising",
        blocks: [
          {
            p: "SSRIs (sertraline, paroxetine, or fluoxetine) are conditionally recommended where psychological therapy hasn't helped sufficiently, isn't available in reasonable time, or isn't what the person wants. Medication is a second-line option, not a substitute for trauma-focused therapy where that's accessible.",
          },
        ],
      },
      {
        heading: "Neuromodulation: TMS",
        evidence: "promising",
        blocks: [
          {
            p: "Repetitive transcranial magnetic stimulation (rTMS) has a growing evidence base for PTSD — a 2025/2026 systematic review and meta-analysis of combat-related PTSD (7 studies, n=963) found robust within-group symptom improvement and an excellent safety profile, though which specific protocol is superior, and how much benefit exceeds sham stimulation, isn't yet well established. It's not first-line and not yet part of Phoenix Australia's core recommendations. Worth knowing for Australian patients specifically: Medicare's TMS rebate (MBS item 14216) currently applies only to treatment-resistant major depressive disorder — PTSD-specific TMS is out-of-pocket, though a patient with comorbid treatment-resistant depression may still qualify under that pathway.",
          },
        ],
      },
      {
        heading: "Ketamine and esketamine",
        evidence: "promising",
        blocks: [
          {
            p: "Neither is TGA-approved for PTSD — use here is entirely off-label, extrapolated from the depression indication. Intravenous racemic ketamine has the stronger PTSD-specific evidence of the two: a 2014 Mount Sinai RCT was the first to show rapid symptom reduction in chronic PTSD, and a 2025 systematic review found response rates ranging widely (17–67%) across small trials — genuinely promising but not yet consistent enough to guide standard dosing or patient selection. Intranasal esketamine has comparatively little PTSD-specific trial evidence; most use for PTSD is extrapolated from its treatment-resistant depression approval rather than tested directly. Given the overlap, this is worth discussing alongside the esketamine caveats already covered on the Major Depressive Disorder page.",
          },
        ],
      },
      {
        heading: "MDMA-assisted therapy — an Australian first",
        evidence: "promising",
        callout: "amber",
        blocks: [
          {
            p: "Australia is currently the only country where MDMA is a legally prescribable medicine specifically for PTSD. Since 1 July 2023, the TGA has permitted authorised psychiatrists to prescribe MDMA (now Schedule 8, previously prohibited) for PTSD under the Authorised Prescriber scheme — a genuine regulatory first, not yet mirrored in the US, UK, or most other jurisdictions (the FDA rejected a similar MDMA-assisted therapy application in 2024). RCT response rates in the underlying research have been reported as high as 50–87%, though trial quality and blinding limitations (MDMA's subjective effects make blinding difficult) mean this should be read as promising rather than conclusive. Access is genuinely limited in practice: a psychiatrist must complete RANZCP's specialist training framework and obtain Human Research Ethics Committee approval before the TGA will grant Authorised Prescriber status, and RANZCP's clinical memorandum recommends reserving it for patients who have tried established first-line treatments (above) without lasting success — it is not a first-line or early-course option. The number of authorised prescribers nationally remains small.",
          },
          {
            p: "Psilocybin was rescheduled at the same time and by the same mechanism, but its TGA-approved indication is treatment-resistant depression, not PTSD — it doesn't currently apply here, and framing it as a PTSD option would misstate what's actually approved.",
          },
        ],
      },
      {
        heading: "PTSD + Alcohol & Drug Use overlap",
        evidence: "promising",
        callout: "amber",
        blocks: [
          {
            p: "Around a third to half of people with PTSD also meet criteria for a substance use disorder, and substance use disorder is associated with the highest treatment drop-out rates of any PTSD comorbidity. Current evidence leans toward integrated or concurrent treatment of both conditions together, rather than treating one and waiting to address the other — trauma-focused exposure-based approaches delivered alongside substance-use treatment have not been shown to worsen substance use, and integrated programs show modest but real advantages. See the Alcohol & Drug Use page for the reverse view of this same overlap.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "Open Arms – Veterans & Families Counselling (1800 011 046) is DVA's dedicated, free, trauma-informed service — available to anyone with at least one day of continuous full-time ADF service, and their families, without needing a Veteran Card. For MDMA-assisted therapy specifically, a GP or psychiatrist referral is the starting point, but availability is currently limited to a small number of authorised psychiatrists nationally — Mind Medicine Australia maintains information on access. TMS and ketamine/esketamine for PTSD are typically private, out-of-pocket options via a psychiatrist.",
              },
              {
                term: "First responders",
                text: "employer EAP as first point of call; Black Dog Institute's 2024 Expert Guidelines on PTSD in emergency service workers provide sector-specific guidance for treating clinicians. Newer interventions (TMS, ketamine, MDMA-assisted therapy) are accessed via psychiatrist referral, generally out-of-pocket, and are not first-line — worth trying established trauma-focused therapy first unless that has already been attempted without success.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "PTSD can develop after experiencing or witnessing traumatic events during service. It's treatable, and most people who get the right treatment see real improvement.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "The most strongly recommended treatments are trauma-focused talking therapies — working through the memory of what happened with a trained therapist, in a structured and paced way. There are a few well-supported approaches (including one called EMDR, which uses guided eye movements rather than talking through the memory in detail) — your therapist can help you choose what fits. Medication can help too, usually alongside therapy rather than instead of it.",
          },
        ],
      },
      {
        heading: "If standard treatment hasn't worked",
        blocks: [
          {
            p: "For PTSD that hasn't responded to the treatments above, a few newer options exist. Australia is currently the only country where a specially authorised psychiatrist can legally prescribe MDMA alongside therapy specifically for PTSD — this is genuinely promising but reserved for people who've already tried established therapy without lasting success, and access is limited to a small number of psychiatrists nationally. TMS (a magnetic stimulation treatment) and ketamine are other options some psychiatrists offer privately, though the evidence for PTSD specifically is still developing and these usually aren't Medicare-subsidised for PTSD.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Open Arms – Veterans & Families Counselling is free, confidential, and available 24/7 on 1800 011 046. You don't need a Veteran Card — just one day of continuous full-time ADF service is enough, and support extends to your family too.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If drinking or drug use has crept up alongside how you've been feeling, that's common and it doesn't mean treatment for PTSD is off the table — addressing both together tends to work better than waiting. Mention it to whoever you're speaking with.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "PTSD in paramedics, police, and firefighters often builds from repeated exposure over a career rather than a single event. It's treatable, and seeking help isn't a mark against your fitness for duty.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "Trauma-focused talking therapy is the most strongly recommended treatment — a structured approach to processing what happened, with a trained therapist. There are a few well-supported approaches (including one called EMDR, which uses guided eye movements) — your therapist can help you choose what fits. Medication can be used alongside this when helpful.",
          },
        ],
      },
      {
        heading: "If standard treatment hasn't worked",
        blocks: [
          {
            p: "For PTSD that hasn't responded to the treatments above, a few newer options exist, though they're generally private and out-of-pocket rather than Medicare-subsidised for PTSD specifically: TMS (magnetic stimulation), ketamine, and — through a small number of specially authorised psychiatrists — MDMA-assisted therapy, which Australia uniquely permits for PTSD. These are reserved for cases where established therapy hasn't worked, not a starting point.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your employer's EAP — it's confidential and free. Peer support programs, common in police, fire, and ambulance services, can also be a lower-barrier first step. If you're police, your force may also have a dedicated welfare unit or psychologist.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "Shift work and drinking culture in emergency services can make alcohol use hard to separate from ordinary unwinding. If it's become how you cope with the job, that's worth raising alongside PTSD support — treating both together tends to work better than treating one at a time.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Trauma-focused psychological therapy is first-line for adult PTSD, ahead of medication. Prolonged exposure, cognitive processing therapy, trauma-focused CBT and EMDR sit at the same strong tier, so the choice can follow patient preference and therapist availability.",
      "SSRIs (sertraline, paroxetine, fluoxetine) are a conditionally recommended second-line option when therapy hasn't helped enough, isn't available in reasonable time, or isn't what the person wants.",
      "TMS, ketamine/esketamine and MDMA-assisted therapy have promising but still developing evidence and are not first-line. Ketamine and esketamine are off-label for PTSD, and PTSD-specific TMS is out-of-pocket.",
      "In Australia, MDMA-assisted therapy for PTSD can only be prescribed by authorised psychiatrists, and is reserved for people who haven't had lasting success with first-line treatment. Access is limited.",
      "Consider co-occurring substance use: current evidence favours treating PTSD and substance use together.",
      "Referral: Open Arms for veterans, and the employer EAP for first responders.",
    ],
    veteran: [
      "PTSD can develop after experiencing or witnessing traumatic events during service. It's treatable, and most people who get the right treatment see real improvement.",
      "The most strongly recommended treatments are trauma-focused talking therapies: working through the memory of what happened with a trained therapist, in a structured and paced way. EMDR, which uses guided eye movements, is one well-supported approach. Medication can help too, usually alongside therapy.",
      "If standard treatment hasn't worked, newer options exist. MDMA-assisted therapy can be prescribed for PTSD in Australia by a small number of specially authorised psychiatrists, and is reserved for people who have already tried established therapy without lasting success. TMS and ketamine are offered privately by some psychiatrists. The evidence for PTSD is still developing, and they usually aren't Medicare-subsidised for PTSD.",
      "Open Arms is free, confidential and available 24/7 on 1800 011 046. You don't need a Veteran Card: one day of continuous full-time ADF service is enough, and support extends to your family.",
      "If drinking or drug use has crept up, that's common and it doesn't mean PTSD treatment is off the table. Addressing both together tends to work better than waiting.",
    ],
    firstResponder: [
      "PTSD in paramedics, police and firefighters often builds from repeated exposure over a career rather than a single event. It's treatable, and seeking help isn't a mark against your fitness for duty.",
      "Trauma-focused talking therapy is the most strongly recommended treatment: a structured approach to processing what happened, with a trained therapist. EMDR, which uses guided eye movements, is one well-supported approach. Medication can be used alongside when helpful.",
      "If standard treatment hasn't worked, newer options exist, though they're generally private and out-of-pocket for PTSD: TMS, ketamine, and MDMA-assisted therapy through a small number of specially authorised psychiatrists. These are for when established therapy hasn't worked, not a starting point.",
      "Start with your employer's EAP, which is confidential and free. Peer support programs can also be a lower-barrier first step, and police forces may have a welfare unit or psychologist.",
      "If alcohol has become how you cope with the job, raise it alongside PTSD support. Treating both together tends to work better than treating one at a time.",
    ],
  },
  sources: [
    {
      label:
        "Phoenix Australia — Australian Guidelines for PTSD, ASD and Complex PTSD (NHMRC-approved, living guideline), Chapter 6: Treatment Recommendations",
      href: "https://www.phoenixaustralia.org/australian-guidelines-for-ptsd/",
    },
    {
      label:
        "American Psychological Association — Clinical Practice Guideline for the Treatment of PTSD in Adults (2025)",
    },
    {
      label:
        "Black Dog Institute — Expert Guidelines: PTSD in Emergency Service Workers (2024)",
      href: "https://www.blackdoginstitute.org.au/wp-content/uploads/2024/03/BDI_PTSD_Guidelines_A4_DIGITAL.pdf",
    },
    {
      label:
        "Efficacy of transcranial magnetic stimulation in the treatment of combat-related PTSD: a systematic review and meta-analysis (2025/2026)",
    },
    {
      label:
        "Feder et al., Efficacy of Intravenous Ketamine for Treatment of Chronic Posttraumatic Stress Disorder: A Randomized Clinical Trial",
    },
    {
      label:
        "Interventional Psychiatry and Emerging Treatments for PTSD: A Systematic Review (2025)",
    },
    {
      label:
        "Therapeutic Goods Administration — MDMA and psilocybin hub; Update on MDMA and psilocybin access and safeguards from 1 July 2023",
    },
    {
      label:
        "RANZCP — Clinical memorandum on the therapeutic use of MDMA for PTSD and psilocybin for treatment-resistant depression",
    },
    {
      label:
        "Concurrent Treatment for Substance Use Disorder and Trauma-Related Comorbidities — evidence review",
      href: "https://pubmed.ncbi.nlm.nih.gov/30226696/",
    },
    {
      label: "Open Arms — Department of Veterans' Affairs",
      href: "https://www.openarms.gov.au",
    },
  ],
  related: ["mdd", "alcohol-and-drug-use"],
  relatedSpokes: [
    { id: "mind", text: "For day-to-day ways to settle a racing, on-guard mind:" },
  ],
};

const alcoholAndDrugUse: Condition = {
  slug: "alcohol-and-drug-use",
  name: "Alcohol & Drug Use",
  description:
    "Treatment options for problem drinking and drug use, and where to start.",
  clinician: {
    sections: [
      {
        heading: "Psychosocial first-line treatment",
        evidence: "strong",
        blocks: [
          {
            p: "Motivational interviewing has Level A evidence across substance types, particularly effective short-term and in less severe dependence. It's typically the starting point regardless of which substance is involved.",
          },
        ],
      },
      {
        heading: "Alcohol",
        evidence: "strong",
        blocks: [
          {
            p: "Acamprosate (Level A) to help maintain abstinence, and naltrexone (Level A) to reduce relapse to heavy drinking, are both recommended. Disulfiram (Level A) is reserved for closely supervised settings. Withdrawal in most cases can be managed ambulatory with a tapering diazepam regimen and staged pharmacy supply.",
          },
        ],
      },
      {
        heading: "Opioids",
        evidence: "strong",
        blocks: [
          {
            p: "Opioid agonist therapy — buprenorphine (including long-acting injectable formulations) or methadone through an approved Opioid Treatment Program — is the established, evidence-based treatment for opioid dependence. It requires accredited prescribing and dispensing arrangements, which vary by state. Naltrexone is used rarely in this context due to poor retention and overdose risk after relapse. Worth screening for in this population specifically given how often opioid dependence begins with pain management following service-related injury (see the Chronic Pain / MSK Injury page for that overlap).",
          },
        ],
      },
      {
        heading: "Stimulants (amphetamines, methamphetamine, cocaine)",
        evidence: "promising",
        blocks: [
          {
            p: "No medication is TGA-approved or PBS-subsidised specifically for stimulant use disorder. The ASAM/AAAP clinical guideline gives a strong recommendation for contingency management (structured incentives for verified abstinence) as the best-evidenced intervention, though access is often limited in practice. Off-label medication options — bupropion, naltrexone combined with bupropion, mirtazapine — have preliminary trial evidence but remain conditional recommendations, not first-line. Worth being aware some stimulant use in this population may relate to managing fatigue from shift work rather than recreational use — worth asking about directly rather than assuming.",
          },
        ],
      },
      {
        heading: "Residential rehabilitation",
        evidence: "traditional",
        blocks: [
          {
            p: "May benefit patients with moderate-to-severe dependence needing a structured setting (Level D — consensus-based, not RCT evidence). Considered after, not instead of, first-line psychosocial and pharmacological options.",
          },
        ],
      },
      {
        heading: "Alcohol & Drug Use + PTSD overlap",
        evidence: "promising",
        callout: "amber",
        blocks: [
          {
            p: "The NHMRC/NDARC Comorbidity Guidelines recommend an integrated approach for co-occurring substance use and PTSD or anxiety, rather than treating one and deferring the other. Substance use in this population is often a coping response to hypervigilance and sleep disruption — worth screening for specifically. See the PTSD page for the reverse view of this same overlap.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "Open Arms (1800 011 046) as first point of contact where substance use sits alongside mental health concerns; National Alcohol and Other Drug Hotline (1800 250 015) for dedicated treatment referral across all substance types.",
              },
              {
                term: "First responders",
                text: "employer EAP as first point of call; National Alcohol and Other Drug Hotline (1800 250 015) for dedicated treatment referral across all substance types.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Alcohol, opioid, or stimulant use that's become hard to control is common among veterans, and often connects to how you've been sleeping, managing pain, or coping with stress since service. It's treatable, and help doesn't require you to have hit rock bottom first.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "A motivational, non-judgemental conversation is typically the starting point, whatever the substance. From there, options differ: medication can help with alcohol or opioid dependence specifically; for stimulants, structured support programs tend to be more effective than medication alone. Residential programs exist for more severe situations but aren't usually the first step.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Open Arms (1800 011 046) is a good first call, especially if stress or PTSD symptoms are part of the picture. The National Alcohol and Other Drug Hotline (1800 250 015) connects you directly to treatment services for any substance.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If you're also dealing with PTSD symptoms or chronic pain, treating those alongside the substance use tends to work better than tackling one at a time — you don't need to get one under control before you're allowed to talk about the rest.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Substance use that's crept past ordinary coping is common in emergency services — sometimes alcohol to unwind, sometimes stimulants to get through shift work, sometimes pain medication that started after an injury. It's treatable, and raising it doesn't have to threaten your career.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "A motivational, non-judgemental conversation is typically the starting point, whatever the substance. Medication can help with alcohol or opioid dependence specifically; for stimulants, structured support programs tend to be more effective than medication alone.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Your employer's EAP is confidential and free. The National Alcohol and Other Drug Hotline (1800 250 015) connects you directly to treatment services for any substance if you'd rather go outside your workplace.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If PTSD symptoms or shift-work fatigue are part of what's driving the substance use, treating those alongside it tends to work better than tackling one at a time.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Motivational interviewing (Level A evidence) is the usual starting point, whichever substance is involved. Residential rehabilitation is considered after, not instead of, first-line psychosocial and medication options.",
      "Alcohol: acamprosate and naltrexone are both recommended (Level A). Disulfiram is reserved for closely supervised settings. In most cases, withdrawal can be managed on an ambulatory basis.",
      "Opioids: opioid agonist therapy (buprenorphine, including long-acting injectables, or methadone through an approved Opioid Treatment Program) is the established treatment. It needs accredited prescribing and dispensing arrangements, which vary by state.",
      "Stimulants: no medication is TGA-approved or PBS-subsidised for stimulant use disorder. Contingency management is the best-evidenced intervention, though access is often limited. Off-label medications are conditional recommendations, not first-line.",
      "Co-occurring PTSD: the NHMRC/NDARC Comorbidity Guidelines recommend an integrated approach rather than treating one condition and deferring the other.",
      "Referral: Open Arms for veterans, the employer EAP for first responders, and the National Alcohol and Other Drug Hotline for treatment referral across all substances.",
    ],
    veteran: [
      "Alcohol, opioid or stimulant use that has become hard to control is common among veterans, and often connects to sleep, pain or stress since service. It's treatable, and you don't have to hit rock bottom first.",
      "Treatment usually starts with a motivational, non-judgemental conversation, whatever the substance.",
      "Medication can help with alcohol or opioid dependence. For stimulants, structured support programs tend to work better than medication alone. Residential programs exist for more severe situations but aren't usually the first step.",
      "Open Arms (1800 011 046) is a good first call, especially if stress or PTSD symptoms are part of the picture. The National Alcohol and Other Drug Hotline (1800 250 015) connects you directly to treatment services for any substance.",
      "If PTSD symptoms or chronic pain are also part of the picture, treating them alongside the substance use tends to work better. You don't need to get one under control before you talk about the rest.",
    ],
    firstResponder: [
      "Substance use that has crept past ordinary coping is common in emergency services: alcohol to unwind, stimulants to get through shift work, or pain medication that started after an injury. It's treatable, and raising it doesn't have to threaten your career.",
      "Treatment usually starts with a motivational, non-judgemental conversation, whatever the substance.",
      "Medication can help with alcohol or opioid dependence. For stimulants, structured support programs tend to work better than medication alone.",
      "Your employer's EAP is confidential and free. The National Alcohol and Other Drug Hotline (1800 250 015) connects you to treatment services for any substance if you'd rather go outside your workplace.",
      "If PTSD symptoms or shift-work fatigue are part of what's driving the substance use, treating those alongside it tends to work better.",
    ],
  },
  sources: [
    {
      label:
        "Australian Guidelines for the Treatment of Alcohol Problems (NHMRC-aligned)",
      href: "https://alcoholtreatmentguidelines.com.au/about",
    },
    {
      label:
        "NHMRC/NDARC Centre of Research Excellence — Guidelines on the Management of Co-occurring Alcohol and Other Drug and Mental Health Conditions",
      href: "https://comorbidityguidelines.org.au/",
    },
    {
      label:
        "NSW/Queensland Clinical Guidelines: Treatment of Opioid Dependence",
      href: "https://www.health.nsw.gov.au/aod/Pages/nsw-clinical-guidelines-opioid.aspx",
    },
    {
      label:
        "ASAM/AAAP Clinical Practice Guideline on the Management of Stimulant Use Disorder",
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/",
    },
    {
      label:
        "Australian Prescriber — Medicines Used in the Treatment of Opioid Dependence (2025)",
      href: "https://doi.org/10.18773/austprescr.2025.028",
    },
  ],
  related: ["ptsd", "chronic-pain"],
  relatedSpokes: [
    { id: "connection", text: "You don't have to do this alone — on staying connected:" },
  ],
};

const mdd: Condition = {
  slug: "mdd",
  name: "Major Depressive Disorder",
  description:
    "Treatments for ongoing low mood, loss of interest and depression.",
  clinician: {
    sections: [
      {
        heading: "Overview",
        evidence: "strong",
        blocks: [
          {
            p: "Treatment selection should be guided by severity. For mild depression, supervised low-to-moderate intensity exercise (30–40 minutes, 3–4 times weekly, for at least 9 weeks) is a genuine first-line monotherapy option, not just an adjunct — worth offering before medication in appropriate patients. For moderate to severe depression, combination psychotherapy plus pharmacotherapy outperforms either alone and reduces recurrence.",
          },
        ],
      },
      {
        heading: "Psychotherapy",
        evidence: "strong",
        blocks: [
          {
            p: "CBT, interpersonal therapy, and behavioural activation are first-line psychotherapies with the most consistent evidence; 12–16 sessions is the typical effective course. Where PTSD is also present, trauma-focused therapy (see the PTSD page) often improves depressive symptoms as well, given the overlap below.",
          },
        ],
      },
      {
        heading: "Pharmacotherapy",
        evidence: "strong",
        blocks: [
          {
            p: "SSRIs remain the default first choice (sertraline or escitalopram are standard starting points). Bupropion, escitalopram, mirtazapine, paroxetine, sertraline, and extended-release venlafaxine are generally considered the most effective agents. Without at least 20% symptom improvement by 4 weeks, response or remission by 8–12 weeks is unlikely — switch or increase dose at that point rather than waiting longer. Worth screening for sexual side effects specifically, which are common with SSRIs and under-reported unless asked about directly — see the Sexual Dysfunction page for management strategies that don't require stopping an otherwise effective antidepressant.",
          },
        ],
      },
      {
        heading: "Non-response and treatment-resistant depression",
        evidence: "promising",
        blocks: [
          {
            p: "Up to 70% of patients don't achieve remission on first-line pharmacotherapy. Standard next steps are dose optimisation, switching, or combination/augmentation — dose escalation of the same SSRI beyond standard range confers no additional benefit. For genuine treatment-resistant depression (inadequate response to 2+ adequate trials), rTMS and ketamine/esketamine both have evidence-based support in Canadian (CANMAT) guidelines, with broadly comparable population-level efficacy in recent network meta-analyses — though evidence quality for both is still rated low-to-moderate. Esketamine (Spravato) is TGA-approved and PBS-listed in Australia since May 2025, but this remains genuinely contested: a 2025 peer-reviewed critique argues current high-quality evidence doesn't support efficacy beyond 1–2 weeks and raises concerns about acute safety data, including suicide risk during treatment. Worth discussing openly with patients considering it rather than presenting it as a settled option.",
          },
        ],
      },
      {
        heading: "PTSD, moral injury, and depression",
        evidence: "strong",
        callout: "amber",
        blocks: [
          {
            p: "This comorbidity is heavily documented: veterans with full PTSD have up to 11-fold higher odds of lifetime MDD compared to those without PTSD, and co-occurring PTSD/depression has roughly doubled over the past two decades in post-9/11 veteran cohorts. The combination carries a greater burden — more functional impairment, more physical health burden, and higher suicidality — than either condition alone. Depression is also common alongside moral injury (see the Moral Injury page), where guilt and shame symptoms can be mistaken for straightforward depression rather than treated with the trauma-informed approaches moral injury specifically needs. Screen for all three together rather than treating whichever presents first in isolation.",
          },
        ],
      },
      {
        heading: "Suicide risk screening",
        evidence: "strong",
        blocks: [
          {
            p: "Direct, routine suicide risk screening is standard of care in MDD, and particularly important given the elevated risk conferred by comorbid PTSD and moral injury in this population. Asking directly does not increase risk and is well-evidenced to improve detection.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "Non-Liability Health Care (NLHC) is the key pathway here — any veteran with as little as one day of full-time ADF service can access fully funded mental health treatment (GP, psychiatrist, psychologist, medication, hospital admission, Open Arms) with no need to prove the condition is service-related and no compensation claim required. A GP referral starts the process. Open Arms (1800 011 046) directly for counselling. In a crisis, Open Arms and Lifeline (13 11 14) are both available 24/7.",
              },
              {
                term: "First responders",
                text: "GP for a Mental Health Care Plan (enabling Medicare-rebated psychology sessions); employer EAP as a confidential first point of contact. In a crisis, Lifeline (13 11 14) is available 24/7.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Depression is common after service, and treatable — whether it shows up on its own or alongside PTSD or physical injury, which happens often.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For milder depression, regular exercise and talking therapy are genuinely effective starting points — not just something to try before \"real\" treatment. For more severe depression, a combination of therapy and medication tends to work better than either alone. If a first medication doesn't help enough after a few weeks, that's normal and usually just means trying a different one or adjusting the dose, not that nothing will work.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "This is the one to know: if you've served even a single day full-time in the ADF, DVA will fund your mental health treatment in full — GP, psychiatrist, psychologist, medication, hospital care if needed — without you having to prove it's connected to your service or lodge a compensation claim. Start with your GP, or call Open Arms directly on 1800 011 046.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "Depression, PTSD, and pain often travel together after service — if you're dealing with more than one, it's worth mentioning all of them to whoever you see, since treating them together tends to work better than treating one at a time. If things ever feel unsafe, Open Arms and Lifeline (13 11 14) are there any time, day or night.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Depression is common in high-stress emergency service roles, and treatable — whether it shows up on its own or alongside stress, trauma symptoms, or chronic pain, which happens often.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For milder depression, regular exercise and talking therapy are genuinely effective starting points — not just something to try before \"real\" treatment. For more severe depression, a combination of therapy and medication tends to work better than either alone. If a first medication doesn't help enough after a few weeks, that's normal and usually just means trying a different one or adjusting the dose, not that nothing will work.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP for a Mental Health Care Plan, which gives you Medicare-rebated sessions with a psychologist. Your employer's EAP is a confidential, free option too — often faster to access than a GP referral.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "Depression, stress, and pain often travel together in this line of work — if you're dealing with more than one, it's worth mentioning all of them to whoever you see, since treating them together tends to work better than treating one at a time. If things ever feel unsafe, Lifeline (13 11 14) is there any time, day or night.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Guide treatment by severity. For mild depression, supervised low-to-moderate intensity exercise (30–40 minutes, 3–4 times weekly, for at least 9 weeks) is a first-line monotherapy option, not just an adjunct. For moderate to severe depression, psychotherapy plus medication outperforms either alone and reduces recurrence.",
      "First-line psychotherapies are CBT, interpersonal therapy and behavioural activation, typically 12–16 sessions.",
      "SSRIs are the default first choice (sertraline or escitalopram are standard starting points). Without at least 20% symptom improvement by 4 weeks, response or remission by 8–12 weeks is unlikely, so switch or increase the dose at that point. Ask directly about sexual side effects.",
      "For treatment-resistant depression (inadequate response to 2+ adequate trials), rTMS and ketamine/esketamine both have support in CANMAT guidelines, though evidence quality is low-to-moderate. Esketamine (Spravato) is TGA-approved and PBS-listed, but its evidence remains contested and is worth discussing openly with patients.",
      "Screen for PTSD, moral injury and depression together rather than treating whichever presents first in isolation. The combination carries more impairment and higher suicidality than either condition alone.",
      "Routine, direct suicide risk screening is standard of care. Asking directly does not increase risk and improves detection.",
      "Referral: veterans with as little as one day of full-time ADF service can access fully funded mental health treatment through Non-Liability Health Care, starting with a GP referral. First responders can use a GP Mental Health Care Plan and the employer EAP.",
    ],
    veteran: [
      "Depression is common after service and treatable, whether it shows up on its own or alongside PTSD or physical injury.",
      "For milder depression, regular exercise and talking therapy are genuinely effective starting points. For more severe depression, therapy and medication together tend to work better than either alone.",
      "If a first medication doesn't help enough after a few weeks, that's normal. It usually means trying a different one or adjusting the dose, not that nothing will work.",
      "If you've served even a single day full-time in the ADF, DVA will fund your mental health treatment in full, with no need to prove it's connected to your service or lodge a compensation claim. Start with your GP, or call Open Arms on 1800 011 046.",
      "Depression, PTSD and pain often travel together after service. If you're dealing with more than one, mention all of them, since treating them together tends to work better.",
    ],
    firstResponder: [
      "Depression is common in high-stress emergency service roles and treatable, whether it shows up on its own or alongside stress, trauma symptoms or chronic pain.",
      "For milder depression, regular exercise and talking therapy are genuinely effective starting points. For more severe depression, therapy and medication together tend to work better than either alone.",
      "If a first medication doesn't help enough after a few weeks, that's normal. It usually means trying a different one or adjusting the dose, not that nothing will work.",
      "Start with your GP for a Mental Health Care Plan, which gives you Medicare-rebated sessions with a psychologist. Your employer's EAP is also confidential and free, and is often faster to access than a GP referral.",
      "Depression, stress and pain often travel together in this line of work. If you're dealing with more than one, mention all of them, since treating them together tends to work better.",
    ],
  },
  sources: [
    {
      label:
        "CANMAT — Management of Major Depressive Disorder in Adults (2025), summarised in American Family Physician",
    },
    {
      label:
        "American College of Physicians — Living Clinical Guideline on Nonpharmacologic and Pharmacologic Treatments of Adults in the Acute Phase of MDD",
    },
    {
      label:
        "Prevalence, Correlates, and Burden of Subthreshold PTSD in US Veterans",
    },
    {
      label:
        "Posttraumatic stress disorder and depression trends from 2001 to 2021 among post-9/11 veterans, US Millennium Cohort Study",
    },
    {
      label:
        "Lugg, The parable of the TGA approval of esketamine (Spravato) in Australia, Parts 1 & 2",
    },
    {
      label:
        "Department of Veterans' Affairs — Non-Liability Health Care (mental health) (DVA website)",
    },
  ],
  related: ["ptsd", "moral-injury", "sexual-dysfunction"],
  relatedSpokes: [
    { id: "movement", text: "Exercise is a genuine first-line step for milder depression — on getting moving:" },
    { id: "mind", text: "On how low mood and stress work, and what helps:" },
  ],
};

const moralInjury: Condition = {
  slug: "moral-injury",
  name: "Moral Injury",
  description:
    "Guilt, shame and lost trust after events that clash with your values.",
  clinician: {
    sections: [
      {
        heading: "What moral injury is",
        blocks: [
          {
            p: "Moral injury isn't a formal DSM diagnosis. It describes the psychological, spiritual, and social impact of events that violate a person's deeply held moral code — participating in, failing to prevent, witnessing, or being betrayed by trusted authority during such an event. Core features are guilt, shame, anger, loss of trust, and existential or spiritual distress, distinct from the fear-based presentation typical of PTSD, though the two frequently co-occur. It's increasingly recognised beyond military contexts — first responders, healthcare workers, and others in high-stakes occupations report it too.",
          },
        ],
      },
      {
        heading: "Elevated risk — screen directly",
        callout: "brick",
        blocks: [
          {
            p: "Moral injury is associated with meaningfully elevated risk of suicidal thinking, independent of PTSD. Screening for it specifically — not assuming a PTSD screen covers it — matters.",
          },
        ],
      },
      {
        heading: "Why standard PTSD treatment can fall short",
        evidence: "promising",
        blocks: [
          {
            p: "Conventional trauma-focused treatments like prolonged exposure target fear-based symptoms and can inadequately address the guilt/shame core of moral injury — in some cases exacerbating it rather than resolving it. This is the main reason moral injury-specific approaches have emerged as a distinct treatment area rather than being folded into general PTSD care.",
          },
        ],
      },
      {
        heading: "Emerging moral injury-specific approaches",
        evidence: "promising",
        blocks: [
          {
            p: "Evidence here is still limited to small, predominantly military-focused studies — genuinely early-stage compared to PTSD's guideline-backed treatments. Options with growing support include:",
          },
          {
            list: [
              "Adaptive Disclosure — an 8-session, exposure-based approach purpose-built for military trauma, loss, and moral injury; combines imaginal exposure with grief-focused and moral repair components",
              "Impact of Killing (IOK) and Restore and Rebuild — newer, moral injury-specific protocols, promising but with thinner evidence bases than Adaptive Disclosure",
              "Cognitive Processing Therapy, adapted for guilt/shame, and Acceptance and Commitment Therapy for shame, humiliation, and anger",
              "Spiritually-integrated approaches (Building Spiritual Strength, Spiritually-Oriented CPT) — relevant where a person's distress is bound up with spiritual or existential meaning, typically delivered jointly by a chaplain and mental health clinician in VA settings; Australian equivalents are less established and worth confirming locally before referring",
            ],
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "Open Arms (1800 011 046) as first point of contact; ask specifically about clinicians experienced in moral injury, not just general trauma, since the distinction matters for treatment choice.",
              },
              {
                term: "First responders",
                text: "employer EAP as first point of call, with the same caveat — moral injury-aware trauma clinicians are not universally available, and a standard PTSD-focused referral may not be the right fit.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Moral injury is what can happen when something during service went against what you believe is right — something you did, didn't stop, witnessed, or were let down by someone you trusted to lead you well. It's different from the fear-based symptoms of PTSD; it tends to feel more like guilt, shame, anger, or a sense that something in you or the world has fundamentally changed.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "Standard PTSD therapy doesn't always fit this well — it's worth telling whoever you see that what you're carrying feels more like guilt or betrayal than fear. Therapies built specifically for this, like Adaptive Disclosure, exist and are showing real promise, even though the research is still young compared to PTSD treatment.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Open Arms (1800 011 046) is a good first call — ask specifically for a clinician experienced with moral injury, not just general trauma.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If things ever feel unbearable, that's worth taking seriously and reaching out about straight away — see the crisis support below. This isn't weakness, and it isn't permanent.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Moral injury can come from decisions made in seconds on the job — who you could and couldn't save, something you saw that broke your sense of how the world should work, or feeling let down by the system you rely on. It's different from the fear-based symptoms of PTSD; it tends to feel more like guilt, shame, anger, or a sense that something has fundamentally shifted.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "Standard PTSD therapy doesn't always fit this well — it's worth telling whoever you see that what you're carrying feels more like guilt or betrayal than fear. Therapies built specifically for this exist and are showing real promise, even though this is a newer, less established area than PTSD treatment.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Your employer's EAP is a starting point — ask specifically for a clinician experienced with moral injury, not just general trauma, since the fit matters.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If things ever feel unbearable, that's worth taking seriously and reaching out about straight away — see the crisis support below. This isn't weakness, and it isn't permanent.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Moral injury isn't a formal DSM diagnosis. It describes the psychological, spiritual and social impact of events that violate a person's deeply held moral code. Core features are guilt, shame, anger, loss of trust and existential or spiritual distress, distinct from the fear-based presentation typical of PTSD, though the two frequently co-occur.",
      "Moral injury is associated with meaningfully elevated risk of suicidal thinking, independent of PTSD. Screen for it directly rather than assuming a PTSD screen covers it.",
      "Conventional trauma-focused treatments such as prolonged exposure target fear-based symptoms. They can inadequately address the guilt and shame at the core of moral injury, and in some cases exacerbate it.",
      "Moral injury-specific approaches include Adaptive Disclosure, Impact of Killing, Restore and Rebuild, adapted Cognitive Processing Therapy, Acceptance and Commitment Therapy, and spiritually-integrated approaches. Support is growing, but the evidence is still limited to small, predominantly military-focused studies.",
      "Spiritually-integrated approaches are typically delivered jointly by a chaplain and a mental health clinician in VA settings. Australian equivalents are less established, so confirm locally before referring.",
      "Referral: Open Arms for veterans, and the employer EAP for first responders. Ask specifically about clinicians experienced in moral injury, since a standard PTSD-focused referral may not be the right fit.",
    ],
    veteran: [
      "Moral injury can follow something during service that went against what you believe is right: something you did, didn't stop, witnessed, or were let down by someone you trusted to lead you well.",
      "It's different from the fear-based symptoms of PTSD. It tends to feel more like guilt, shame, anger, or a sense that something in you or the world has fundamentally changed.",
      "Standard PTSD therapy doesn't always fit well. Tell whoever you see that what you're carrying feels more like guilt or betrayal than fear. Therapies built for this, like Adaptive Disclosure, are showing real promise, though the research is still young.",
      "Open Arms (1800 011 046) is a good first call. Ask for a clinician experienced with moral injury, not just general trauma.",
      "If things ever feel unbearable, take that seriously and reach out straight away. See the crisis support at the bottom of this page. This isn't weakness, and it isn't permanent.",
    ],
    firstResponder: [
      "Moral injury can come from decisions made in seconds on the job: who you could and couldn't save, something you saw that broke your sense of how the world should work, or feeling let down by the system you rely on.",
      "It's different from the fear-based symptoms of PTSD. It tends to feel more like guilt, shame, anger, or a sense that something has fundamentally shifted.",
      "Standard PTSD therapy doesn't always fit well. Tell whoever you see that what you're carrying feels more like guilt or betrayal than fear. Therapies built specifically for this exist and are showing real promise, though this is a newer, less established area than PTSD treatment.",
      "Your employer's EAP is a starting point. Ask for a clinician experienced with moral injury, not just general trauma, since the fit matters.",
      "If things ever feel unbearable, take that seriously and reach out straight away. See the crisis support at the bottom of this page. This isn't weakness, and it isn't permanent.",
    ],
  },
  sources: [
    {
      label:
        "Moral injury prevention and intervention — European Journal of Psychotraumatology, 2025 review",
      href: "https://doi.org/10.1080/20008066.2025.2567721",
    },
    {
      label:
        "Adaptive Disclosure — Litz, Lebowitz, Gray & Nash (Guilford Publications); PHCoE Evidence Brief",
      href: "https://health.mil/Reference-Center/Publications/2021/04/26/PHCoE-Evidence-Brief-Adaptive-Disclosure-for-Posttraumatic-Stress-Disorder",
    },
    {
      label:
        "Implementing Building Spiritual Strength for Moral Injury Syndrome — VA implementation study",
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11047717/",
    },
  ],
  related: ["ptsd", "mdd"],
  relatedSpokes: [
    { id: "connection", text: "Rebuilding trust and connection takes time — on support:" },
  ],
};

const chronicPain: Condition = {
  slug: "chronic-pain",
  name: "Chronic Pain / MSK Injury",
  description:
    "Treatment options for long-term pain and injuries to muscles, bones and joints.",
  clinician: {
    sections: [
      {
        heading: "Overview",
        evidence: "strong",
        blocks: [
          {
            p: "The IASP defines chronic pain as pain persisting or recurring beyond 3 months, without the clear biological value of acute pain. It's a biopsychosocial condition — biological, psychological, and social factors all shape severity and impact, not just tissue pathology. It's especially prevalent in this population: musculoskeletal injury from service or operational duties is common, and studies of veteran cohorts have found chronic pain in roughly two-thirds of veterans and around half of currently serving military personnel.",
          },
        ],
      },
      {
        heading: "First-line management",
        evidence: "strong",
        blocks: [
          {
            p: "Both the CDC (2022) and WHO (2023, chronic low back pain) guidelines prioritise non-pharmacological approaches: tailored physical activity and exercise, physiotherapy, and psychological therapy (particularly CBT for pain) are consistently recommended as first-line or foundational. Non-opioid pharmacological options (paracetamol, NSAIDs where appropriate) come next. This applies regardless of the specific MSK diagnosis — the functional, exercise-based approach outperforms rest and passive treatment across nearly all common conditions (back pain, knee/shoulder osteoarthritis, non-specific MSK pain).",
          },
        ],
      },
      {
        heading: "Opioids: not first-line",
        evidence: "strong",
        blocks: [
          {
            p: "Current guidelines are explicit that opioids are not recommended as first-line or routine therapy for chronic pain — evidence for long-term efficacy is weak and risk of harm, including opioid use disorder, is well-established (see the Alcohol & Drug Use page for the overlap, particularly relevant here given how often opioid dependence in this population begins with pain management following service-related injury). Where opioids are already long-term, individualised management matters more than abrupt discontinuation — sudden cessation carries its own risks. Where initiating opioid therapy is genuinely being considered, shared decision-making, the lowest effective dose, and early follow-up (within 1–4 weeks) are recommended.",
          },
        ],
      },
      {
        heading: "Central sensitisation",
        evidence: "promising",
        blocks: [
          {
            p: "In persistent pain, the nervous system itself can become sensitised — pain signalling pathways become hyperresponsive, amplifying perceived pain beyond what tissue damage alone would predict. This helps explain why pain can persist and even worsen after tissue healing is complete, and reframing pain this way with patients (rather than searching for an ongoing structural cause) is often clinically useful, though it's an evolving area of the literature rather than a settled diagnostic entity.",
          },
        ],
      },
      {
        heading: "Chronic pain and PTSD: mutual maintenance",
        evidence: "strong",
        callout: "amber",
        blocks: [
          {
            p: "The mutual maintenance model — well-supported specifically in veteran and military cohorts — describes how PTSD and chronic pain reinforce each other through shared mechanisms: hyperarousal increases pain severity and interference, intrusive trauma memories increase the odds of chronic pain, and pain-related anxiety increases the odds of PTSD. Attentional bias toward threat and pain, avoidance of activity, and catastrophic thinking all feed both conditions simultaneously. In practice this means treating one condition in isolation tends to underperform an integrated approach — see the PTSD page for the reverse view of this overlap, and the Alcohol & Drug Use page for the opioid-specific version of the same pattern.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "GP as care coordinator for a DVA allied health referral (the \"treatment cycle\" — up to 12 sessions or 1 year per referral, renewable indefinitely where clinically justified). Gold Card holders are covered for physiotherapy and other allied health for any condition; White Card holders need the condition accepted as service-related first. Open Arms (1800 011 046) where PTSD or psychological distress is part of the picture; multidisciplinary pain clinic referral for complex or refractory cases.",
              },
              {
                term: "First responders",
                text: "GP referral to physiotherapy or a pain specialist; workers' compensation pathway where the injury is occupational; employer EAP where psychological distress or PTSD symptoms overlap with the pain presentation.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Ongoing pain from an old injury — back, joints, or anywhere else — is extremely common after service. It's genuinely one of the most common issues veterans deal with, and there's a lot that can help beyond just medication.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "Movement-based approaches — physiotherapy, tailored exercise, and sometimes psychological support for managing pain — are the starting point and tend to work better long-term than rest or strong pain medication alone. Opioid painkillers are no longer considered a good first option for ongoing pain, given the real risk of dependence; if you're already on them long-term, that's a conversation to have with your GP rather than something to stop abruptly on your own.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP, who can refer you for DVA-funded physiotherapy or allied health. If you hold a Gold Card, this is generally covered for any condition; if you hold a White Card, the condition needs to be accepted as service-related first — your GP can help with that. Open Arms (1800 011 046) is worth calling if PTSD symptoms or low mood are tangled up with the pain, which is very common.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "Pain and PTSD genuinely feed each other — hypervigilance makes pain feel worse, and pain can be a constant reminder of what caused it. Treating both together usually works better than tackling one at a time.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Ongoing pain from an old injury — back, joints, or anywhere else — is extremely common in physically demanding emergency service roles. There's a lot that can help beyond just medication.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "Movement-based approaches — physiotherapy, tailored exercise, and sometimes psychological support for managing pain — are the starting point and tend to work better long-term than rest or strong pain medication alone. Opioid painkillers are no longer considered a good first option for ongoing pain, given the real risk of dependence; if you're already on them long-term, that's a conversation to have with your GP rather than something to stop abruptly on your own.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP for a physiotherapy referral. If the injury is work-related, a workers' compensation claim may cover ongoing treatment — check with your employer or union. Your employer's EAP is a confidential place to raise it if stress or PTSD symptoms seem tangled up with the pain.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "Pain and stress or trauma symptoms genuinely feed each other — being on constant alert makes pain feel worse, and pain can be a constant reminder of a difficult incident. Treating both together usually works better than tackling one at a time.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "The IASP defines chronic pain as pain persisting or recurring beyond 3 months. It is a biopsychosocial condition, and is especially prevalent in this population: cohort studies have found chronic pain in roughly two-thirds of veterans and around half of currently serving military personnel.",
      "First-line management is non-pharmacological: tailored physical activity and exercise, physiotherapy, and psychological therapy (particularly CBT for pain). Non-opioid options (paracetamol, NSAIDs where appropriate) come next. The functional, exercise-based approach outperforms rest and passive treatment across nearly all common conditions.",
      "Opioids are not recommended as first-line or routine therapy for chronic pain. Where opioids are already long-term, individualised management matters more than abrupt discontinuation. If starting opioids is genuinely being considered: shared decision-making, the lowest effective dose, and follow-up within 1–4 weeks.",
      "Central sensitisation may help explain persistent pain, and reframing pain this way with patients is often clinically useful, though it is an evolving area of the literature and not a settled diagnostic entity.",
      "Chronic pain and PTSD maintain each other (the mutual maintenance model, well-supported in veteran and military cohorts). Treating one in isolation tends to underperform an integrated approach.",
      "Referral: for veterans, the GP acts as care coordinator for a DVA allied health referral. Gold Card holders are covered for any condition, and White Card holders need the condition accepted as service-related first. For first responders, GP referral to physiotherapy or a pain specialist, workers' compensation where the injury is occupational, and the employer EAP where psychological distress overlaps.",
    ],
    veteran: [
      "Ongoing pain from an old injury is extremely common after service, and there's a lot that can help beyond medication.",
      "Movement-based approaches (physiotherapy, tailored exercise, and sometimes psychological support for managing pain) are the starting point, and tend to work better long-term than rest or strong pain medication alone.",
      "Opioid painkillers are no longer considered a good first option for ongoing pain, because of the real risk of dependence. If you're already on them long-term, talk to your GP rather than stopping abruptly on your own.",
      "Start with your GP, who can refer you for DVA-funded physiotherapy or allied health. With a Gold Card this is generally covered for any condition. With a White Card the condition needs to be accepted as service-related first, and your GP can help with that. Open Arms (1800 011 046) is worth calling if PTSD symptoms or low mood are tangled up with the pain.",
      "Pain and PTSD feed each other. Hypervigilance makes pain feel worse, and pain can be a constant reminder of what caused it. Treating both together usually works better than tackling one at a time.",
    ],
    firstResponder: [
      "Ongoing pain from an old injury is extremely common in physically demanding emergency service roles, and there's a lot that can help beyond medication.",
      "Movement-based approaches (physiotherapy, tailored exercise, and sometimes psychological support for managing pain) are the starting point, and tend to work better long-term than rest or strong pain medication alone.",
      "Opioid painkillers are no longer considered a good first option for ongoing pain, because of the real risk of dependence. If you're already on them long-term, talk to your GP rather than stopping abruptly on your own.",
      "Start with your GP for a physiotherapy referral. If the injury is work-related, a workers' compensation claim may cover ongoing treatment, so check with your employer or union. Your employer's EAP is a confidential place to raise it if stress or PTSD symptoms seem tangled up with the pain.",
      "Pain and stress or trauma symptoms feed each other. Being on constant alert makes pain feel worse, and pain can be a constant reminder of a difficult incident. Treating both together usually works better than tackling one at a time.",
    ],
  },
  sources: [
    {
      label:
        "CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022",
    },
    {
      label:
        "World Health Organization — Guideline for Non-Surgical Management of Chronic Primary Low Back Pain in Adults (2023)",
    },
    {
      label:
        "Sharp & Harvey, Chronic pain and posttraumatic stress disorder: mutual maintenance? (2001)",
    },
    {
      label:
        "Associations of chronic pain and PTSD factors among military personnel: An exploration of the mutual maintenance model, Journal of Military, Veteran and Family Health (2024)",
    },
    {
      label:
        "Department of Veterans' Affairs — Physiotherapy services and Allied Health (DVA website)",
    },
  ],
  related: ["ptsd", "alcohol-and-drug-use"],
  relatedSpokes: [
    { id: "body", text: "On easing the day-to-day load on your body:" },
    { id: "movement", text: "Movement is the first-line approach — on small, doable steps:" },
  ],
};

const bruxism: Condition = {
  slug: "bruxism",
  name: "Bruxism / Obstructive Sleep Apnoea",
  description:
    "Teeth grinding and breathing pauses during sleep, and how they are treated.",
  clinician: {
    sections: [
      {
        heading: "What bruxism is",
        evidence: "strong",
        blocks: [
          {
            p: "A 2025 international consensus redefined bruxism as repetitive jaw-muscle activity — clenching, grinding, or bracing/thrusting the mandible — rather than a disorder in itself. It has two distinct circadian forms with different aetiology: sleep bruxism (SB) and awake bruxism (AB). Clinical relevance depends on whether it's producing damage, pain, or other consequences, not on the activity alone.",
          },
        ],
      },
      {
        heading: "What obstructive sleep apnoea is",
        evidence: "strong",
        blocks: [
          {
            p: "Obstructive sleep apnoea (OSA) is repetitive partial or complete collapse of the upper airway during sleep, causing pauses in breathing, fragmented sleep, and reduced oxygen levels. It's strongly linked to sleep bruxism — the two frequently co-occur, and jaw-clenching episodes are increasingly understood as, in part, a protective reflex that helps reopen a partially obstructed airway. Screening for one should prompt screening for the other.",
          },
        ],
      },
      {
        heading: "Diagnosis",
        evidence: "strong",
        blocks: [
          {
            p: "For bruxism: primarily clinical. The ICSD-3-TR criteria (2023) require reported grinding/clenching during sleep plus at least one associated sign or symptom; brief validated screening tools (e.g. BruxScreen) are more practical in general practice than instrumented assessment. Tooth wear alone lacks specificity, since it can reflect past rather than current activity.",
          },
          {
            p: "For OSA: polysomnography (PSG) is the gold standard, but a Medicare-rebated home-based (Level 2) sleep study with a GP referral is often the practical first step. The STOP-Bang questionnaire is the standard screening tool, but it relies heavily on age, BMI, and blood pressure — a 2022 study found it misses a large proportion of OSA in younger veterans with PTSD, who often don't fit that risk profile. Worth pursuing objective testing in this population even when STOP-Bang scores low, if snoring, witnessed pauses in breathing, or unrefreshing sleep are reported.",
          },
        ],
      },
      {
        heading: "Protecting teeth: occlusal splints",
        evidence: "traditional",
        blocks: [
          {
            p: "Occlusal splints remain first-line for preventing dental damage and reducing grinding noise, and are low-risk. Evidence for reducing underlying muscle activity is weak and effects on EMG-measured events are transient — they manage consequences rather than treat the cause. Still worth prescribing as a protective measure while other approaches are considered.",
          },
        ],
      },
      {
        heading: "OSA treatment, and where it overlaps with bruxism management",
        evidence: "strong",
        blocks: [
          {
            p: "CPAP remains first-line for moderate-to-severe OSA (AASM, 2025 update). For patients who don't tolerate CPAP, or with mild-moderate disease, a custom mandibular advancement device (MAD) — fitted by a qualified dentist — is a guideline-recommended alternative that holds the lower jaw forward to keep the airway open. This is worth knowing specifically in bruxism patients: a well-fitted MAD can serve a protective, splint-like function for the teeth as well as treating the underlying OSA, making dental referral relevant to both conditions at once rather than two separate appliances.",
          },
        ],
      },
      {
        heading: "Behavioural and psychological approaches",
        evidence: "traditional",
        blocks: [
          {
            p: "Sleep hygiene counselling, habit-awareness training for awake bruxism, and relaxation techniques are commonly recommended as a reasonable first step — low evidence of efficacy specifically for bruxism, but low risk and often useful for the comorbid stress or sleep disruption driving it.",
          },
        ],
      },
      {
        heading: "Pharmacological and procedural options for bruxism",
        evidence: "promising",
        blocks: [
          {
            p: "Botulinum toxin A injection into the masseter (and sometimes temporalis) has more positive systematic review evidence as of 2023–2025 than earlier reviews suggested — reductions in bruxism frequency and pain are reported across several RCTs — though it isn't yet established first-line and isn't PBS-subsidised for this indication. Clonazepam has been reported to help in patients with psychiatric or sleep comorbidities, but lacks RCT support and carries real dependence risk — worth particular caution in this population given comorbid PTSD and the overlap with substance use covered on the Alcohol & Drug Use page.",
          },
        ],
      },
      {
        heading: "Bruxism, OSA, and PTSD",
        evidence: "strong",
        callout: "amber",
        blocks: [
          {
            p: "The overlap between OSA and PTSD is well-documented and larger than the bruxism-PTSD link on its own: one VA outpatient psychiatry study found OSA in 35.5% of patients with PTSD (37.8% with MDD); a small pilot study of war veterans in PTSD treatment found 95% screened positive on STOP-Bang, though that sample was small and should be read as hypothesis-generating rather than definitive. As above, standard screening tools may under-detect OSA in younger veterans with PTSD specifically, so a low STOP-Bang score shouldn't fully rule it out where symptoms suggest otherwise. The stress/hyperarousal-bruxism link described elsewhere on this page remains observational and less robustly quantified than the OSA-PTSD association — worth treating as the weaker of the two connections when weighing clinical priority. See the PTSD page for the reverse view of this overlap.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "a DVA-registered dentist for bruxism assessment and splint/MAD provision. Gold Card holders are generally covered for clinically necessary dental treatment and for CPAP equipment via DVA's Rehabilitation Appliances Program. White Card holders need bruxism and/or sleep apnoea accepted as service-related conditions first — often as secondary to an already-accepted PTSD or anxiety diagnosis — which a GP can help document; dental attrition from bruxism was added to DVA's streamlined claims list in December 2024. A GP referral for a Medicare-rebated sleep study is the starting point for suspected OSA regardless of card type.",
              },
              {
                term: "First responders",
                text: "referral to a dentist via their GP or private health cover for bruxism; GP referral for a Medicare-rebated sleep study for suspected OSA. CPAP equipment itself isn't Medicare-funded — private health \"extras\" cover often rebates part of the cost, and state-based public equipment programs (eligibility varies by state) are worth checking where private cover isn't available. Employer EAP as a starting point where stress or shift-work fatigue appears to be a driver of either condition.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Grinding or clenching your teeth — whether you notice it during the day or your partner mentions it at night — is common, and often connects to stress, sleep, or PTSD symptoms rather than being a separate problem on its own. It's also worth knowing that jaw clenching at night can sometimes be your body's response to briefly struggling to breathe — a condition called obstructive sleep apnoea (OSA), which is very common in veterans with PTSD.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For grinding, a custom mouthguard (splint) is the standard first step — it protects your teeth, though it won't necessarily stop the clenching itself. If loud snoring, pauses in breathing (sometimes noticed by a partner), or waking up tired despite a full night's sleep are also happening, it's worth asking your GP about a sleep study — this can be done at home and is partly covered by Medicare. If sleep apnoea is confirmed, a CPAP machine or a custom mouthguard-style device can both treat it, and the mouthguard option can sometimes do double duty for grinding too.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "See a DVA-registered dentist for the grinding side. For sleep apnoea, start with your GP for a referral to a sleep study. If you hold a Gold Card, CPAP equipment is generally fully funded through DVA. If you hold a White Card, sleep apnoea needs to be accepted as a condition first — this is often linked to PTSD, and your GP can help make that case.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "The standard screening questionnaire for sleep apnoea can miss it in younger veterans, especially with PTSD — so if you have symptoms like loud snoring or daytime exhaustion, it's worth pushing for a proper sleep study even if an initial screening quiz says you're low risk.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Grinding or clenching your teeth — whether you notice it during the day or someone mentions it at night — is common, and often connects to stress, shift work, or poor sleep rather than being a separate problem on its own. It's also worth knowing that jaw clenching at night can sometimes be your body's response to briefly struggling to breathe — a condition called obstructive sleep apnoea (OSA).",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For grinding, a custom mouthguard (splint) from a dentist is the standard first step — it protects your teeth, though it won't necessarily stop the clenching itself. If loud snoring, pauses in breathing, or waking up tired despite a full night's sleep are also happening, it's worth asking your GP about a sleep study — this can be done at home and is partly covered by Medicare. If sleep apnoea is confirmed, a CPAP machine or a custom mouthguard-style device can both treat it, and the mouthguard option can sometimes do double duty for grinding too.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP or dentist for the grinding side — private health cover often contributes toward a splint. For sleep apnoea, your GP can refer you for a Medicare-rebated sleep study; CPAP equipment itself isn't Medicare-funded, but private health \"extras\" cover often rebates part of the cost, and some states run public equipment programs worth checking.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If stress, poor sleep, or shift-work fatigue are part of what's driving the grinding, treating those alongside the dental side tends to work better than tackling the teeth in isolation — and it's worth mentioning any snoring or breathing pauses to your GP even if you don't feel unusually tired.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Bruxism is now defined as repetitive jaw-muscle activity (clenching, grinding, or bracing/thrusting the mandible), not as a disorder in itself. It has two forms, sleep bruxism and awake bruxism. Clinical relevance depends on whether it is producing damage, pain or other consequences.",
      "OSA is strongly linked to sleep bruxism and the two frequently co-occur, so screening for one should prompt screening for the other. The OSA–PTSD overlap is well documented and larger than the bruxism–PTSD link, which is observational and the weaker of the two connections when weighing clinical priority.",
      "Diagnosing bruxism is primarily clinical, and tooth wear alone lacks specificity. For suspected OSA, a Medicare-rebated home-based sleep study with a GP referral is often the practical first step. STOP-Bang can miss OSA in younger veterans with PTSD, so pursue objective testing if snoring, witnessed pauses in breathing or unrefreshing sleep are reported, even when the score is low.",
      "Occlusal splints remain first-line for preventing dental damage. They manage consequences rather than treat the cause, and evidence for reducing underlying muscle activity is weak.",
      "CPAP is first-line for moderate-to-severe OSA. A custom mandibular advancement device (MAD) fitted by a qualified dentist is a guideline-recommended alternative when CPAP isn't tolerated or the disease is mild-moderate, and can also serve a protective, splint-like role for the teeth.",
      "Botulinum toxin A has more positive evidence for bruxism than earlier reviews suggested, but isn't established first-line and isn't PBS-subsidised for this indication. Clonazepam lacks RCT support and carries real dependence risk, so take particular caution given comorbid PTSD and substance use.",
      "Referral: for suspected OSA, a GP referral for a Medicare-rebated sleep study. For bruxism, a dentist (DVA-registered for veterans, or via GP or private cover for first responders). CPAP equipment isn't Medicare-funded: Gold Card holders are generally covered through DVA, and first responders may get help from private extras cover or state programs.",
    ],
    veteran: [
      "Grinding or clenching your teeth is common, and often connects to stress, sleep or PTSD symptoms rather than being a separate problem on its own.",
      "Jaw clenching at night can sometimes be your body's response to briefly struggling to breathe, a condition called obstructive sleep apnoea (OSA), which is very common in veterans with PTSD.",
      "For grinding, a custom mouthguard (splint) is the standard first step. It protects your teeth, though it won't necessarily stop the clenching itself.",
      "If you also have loud snoring, pauses in breathing, or wake up tired despite a full night's sleep, ask your GP about a sleep study. It can be done at home and is partly covered by Medicare. If sleep apnoea is confirmed, a CPAP machine or a custom mouthguard-style device can treat it, and the mouthguard option can sometimes do double duty for grinding too.",
      "See a DVA-registered dentist for grinding. With a Gold Card, CPAP equipment is generally fully funded through DVA. With a White Card, sleep apnoea needs to be accepted as a condition first (often linked to PTSD), and your GP can help make that case.",
      "The standard screening questionnaire for sleep apnoea can miss it in younger veterans, especially with PTSD. If you have symptoms like loud snoring or daytime exhaustion, push for a proper sleep study even if the questionnaire says you're low risk.",
    ],
    firstResponder: [
      "Grinding or clenching your teeth is common, and often connects to stress, shift work or poor sleep rather than being a separate problem on its own.",
      "Jaw clenching at night can sometimes be your body's response to briefly struggling to breathe, a condition called obstructive sleep apnoea (OSA).",
      "For grinding, a custom mouthguard (splint) from a dentist is the standard first step. It protects your teeth, though it won't necessarily stop the clenching itself.",
      "If you also have loud snoring, pauses in breathing, or wake up tired despite a full night's sleep, ask your GP about a sleep study. It can be done at home and is partly covered by Medicare. If sleep apnoea is confirmed, a CPAP machine or a custom mouthguard-style device can treat it, and the mouthguard option can sometimes do double duty for grinding too.",
      "Start with your GP or dentist for grinding. Private health cover often contributes toward a splint. CPAP equipment isn't Medicare-funded, but private health extras cover often rebates part of the cost, and some states run public equipment programs worth checking.",
      "If stress, poor sleep or shift-work fatigue are part of what's driving the grinding, treating those alongside the dental side tends to work better. Mention any snoring or breathing pauses to your GP, even if you don't feel unusually tired.",
    ],
  },
  sources: [
    {
      label:
        "International Consensus on the Definition and Grading of Bruxism (2025)",
    },
    {
      label:
        "International Classification of Sleep Disorders, Third Edition — Text Revision (ICSD-3-TR, 2023)",
    },
    { label: "Bruxism Management — StatPearls (NCBI Bookshelf)" },
    {
      label:
        "Ågren et al., The effect of botulinum toxin injections on bruxism: a systematic review (2020); Chen et al., Effectiveness of Botulinum Toxin Injection on Bruxism: a systematic review and meta-analysis of RCTs (2023)",
    },
    {
      label:
        "Dal Fabbro et al., Understanding the clinical management of co-occurring sleep-related bruxism and obstructive sleep apnea in adults (2025)",
    },
    {
      label:
        "AASM, Evaluation and Management of Obstructive Sleep Apnea in Adults Hospitalized for Medical Care (2025)",
    },
    {
      label:
        "Lyons et al., STOP-BANG screener vs objective obstructive sleep apnea testing among younger veterans with PTSD and insomnia, Journal of Clinical Sleep Medicine (2022)",
    },
    {
      label:
        "Incidence of Obstructive Sleep Apnea With PTSD and Mood Disorders, Journal of Clinical Psychiatry Companion (2021)",
    },
    {
      label:
        "Department of Veterans' Affairs — Bruxism and access to dental treatment; Rehabilitation Appliances Program (DVA website)",
    },
  ],
  related: ["ptsd", "alcohol-and-drug-use"],
  relatedSpokes: [
    { id: "sleep", text: "On rest, light and settling your body clock:" },
  ],
};

const sexualDysfunction: Condition = {
  slug: "sexual-dysfunction",
  name: "Sexual Dysfunction",
  description:
    "Problems with sexual desire or function, and treatments that can help.",
  clinician: {
    sections: [
      {
        heading: "Overview",
        evidence: "strong",
        blocks: [
          {
            p: "Sexual dysfunction spans difficulties with desire, arousal, orgasm, and pain, and affects men and women. It's under-asked-about in general practice — a brief, direct question during routine review (e.g. a validated screener like the Decreased Sexual Desire Screener, or simply asking) meaningfully increases detection. Assessment should include medication review, relevant comorbidities, and — particularly in this population — screening for PTSD and chronic stress, given the strength of that association below.",
          },
        ],
      },
      {
        heading: "Erectile dysfunction",
        evidence: "strong",
        blocks: [
          {
            p: "PDE5 inhibitors (sildenafil, tadalafil, vardenafil, avanafil) remain first-line for most men (Level A, ICSM 2024). Second-line options — intracavernosal or intraurethral alprostadil, vacuum erection devices — are effective and worth offering where PDE5 inhibitors are contraindicated, ineffective, or declined. Penile prostheses are reserved for refractory cases. Treatment should be personalised to patient and partner preference rather than defaulting straight to medication.",
          },
        ],
      },
      {
        heading: "Female sexual dysfunction",
        evidence: "strong",
        blocks: [
          {
            p: "Hypoactive sexual desire disorder (HSDD) is the most common female sexual dysfunction. The 2024 International Consultation on Sexual Medicine consensus and the ISSWSH process of care both recommend a biopsychosocial approach: education and addressing modifiable contributing factors first (pain, arousal difficulties, sleep, depression, medications affecting desire), before hormonal or non-hormonal pharmacological options. Flibanserin can be considered for premenopausal women without depression, with appropriate counselling on alcohol interaction risk. Vaginal moisturisers/lubricants and topical hormonal therapy are useful first steps where arousal or pain symptoms predominate.",
          },
        ],
      },
      {
        heading: "Medication-induced sexual dysfunction",
        evidence: "strong",
        blocks: [
          {
            p: "Worth actively screening for given how often this population is prescribed SSRIs/SNRIs for PTSD, depression, or anxiety — antidepressant-induced sexual dysfunction affects roughly 30–60% of SSRI users across desire, arousal, and orgasm domains, and is under-reported unless asked about directly. Evidence-supported strategies: wait and monitor if mild; dose reduction where clinically appropriate; switching to a lower-risk agent (bupropion, mirtazapine, agomelatine); or augmenting with bupropion (150–300mg XL — the best-supported augmentation option) or a PDE5 inhibitor. Don't assume the underlying mental health condition is the only driver before checking the medication.",
          },
        ],
      },
      {
        heading: "PTSD and sexual dysfunction",
        evidence: "strong",
        callout: "amber",
        blocks: [
          {
            p: "This overlap is unusually well-documented: rates of sexual dysfunction as high as 89% have been reported in male combat veterans with PTSD, with up to a 30-fold increase in erectile dysfunction risk specifically. In women veterans and service members, PTSD severity — particularly avoidance and negative alterations in cognition/mood symptom clusters — is associated with lower sexual satisfaction and function; this holds for trauma-exposed women more broadly, including after military sexual trauma. Mechanistically, chronic sympathetic hyperarousal directly opposes the parasympathetic activation needed for arousal, while emotional numbing and avoidance symptoms reduce desire and willingness to engage. Trauma-focused therapy for PTSD (see the PTSD page) often improves sexual function as a secondary benefit; integrated care combining that with PDE5 inhibitors or psychosexual counselling where needed tends to outperform treating either in isolation. Worth asking about directly — patients frequently won't raise it unprompted.",
          },
        ],
      },
      {
        heading: "Referral pathways",
        blocks: [
          {
            defs: [
              {
                term: "Veterans",
                text: "GP as first point of contact for assessment and RPBS-subsidised PDE5 inhibitor prescription. Gold Card and Orange Card holders can access RPBS medicines for any condition; White Card holders can access them where the condition (or an underlying accepted condition such as PTSD) is covered by their card — standard concessional co-payment applies. Open Arms (1800 011 046) where PTSD or relationship strain is part of the picture. Refer to a urologist or sexual health physician for refractory ED or complex female sexual dysfunction.",
              },
              {
                term: "First responders",
                text: "GP for assessment and prescription; employer EAP where stress, shift work, or relationship strain appears to be a contributing factor; referral to a psychosexual counsellor or sexual health physician for persistent difficulties.",
              },
            ],
          },
        ],
      },
    ],
  },
  veteran: {
    intro:
      "Changes in desire, arousal, or performance are common after service — far more common than most people realise, and often connected to PTSD, medications, or stress rather than being a separate problem to feel embarrassed about.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For erectile difficulties, tablets like Viagra or Cialis (sildenafil/tadalafil) are the standard starting point and work well for most men; other options exist if these aren't suitable. For low desire or arousal difficulties, treatment usually starts with addressing what might be contributing — sleep, medications, stress, or relationship factors — before considering medication-based options. If you're on an antidepressant for PTSD or depression, it's worth knowing these can affect sexual function, and there are ways to manage that without necessarily stopping the medication.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP. If you hold a Gold Card or Orange Card, medications like sildenafil are subsidised through the RPBS at the normal concession co-payment. If you hold a White Card, this may still be covered if it connects to an already-accepted condition like PTSD — worth asking your GP. Open Arms (1800 011 046) is a good option if PTSD symptoms or relationship strain are part of what's going on.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "This is genuinely common with PTSD — studies of combat veterans have found the large majority report some sexual difficulty. It's not a sign anything is permanently wrong, and treating PTSD symptoms often improves things on its own alongside any specific treatment for the sexual side of it.",
          },
        ],
      },
    ],
  },
  firstResponder: {
    intro:
      "Changes in desire, arousal, or performance are common in high-stress occupations — often connected to shift work, chronic stress, or medications rather than being a separate problem to feel embarrassed about.",
    sections: [
      {
        heading: "What treatment usually looks like",
        blocks: [
          {
            p: "For erectile difficulties, tablets like Viagra or Cialis (sildenafil/tadalafil) are the standard starting point and work well for most men; other options exist if these aren't suitable. For low desire or arousal difficulties, treatment usually starts with addressing what might be contributing — sleep, medications, stress, or relationship factors — before considering medication-based options. If you're on an antidepressant for anxiety or depression, it's worth knowing these can affect sexual function, and there are ways to manage that without necessarily stopping the medication.",
          },
        ],
      },
      {
        heading: "Where to get help",
        blocks: [
          {
            p: "Start with your GP — private health cover often contributes toward specialist referral if needed. Your employer's EAP is a confidential place to raise stress or shift-work factors alongside it.",
          },
        ],
      },
      {
        heading: "Worth knowing",
        blocks: [
          {
            p: "If ongoing stress, poor sleep, or trauma symptoms are part of the picture, addressing those tends to improve things alongside any specific treatment for the sexual side of it — not instead of it.",
          },
        ],
      },
    ],
  },
  keyPoints: {
    clinician: [
      "Sexual dysfunction spans desire, arousal, orgasm and pain, and affects men and women. It is under-asked-about in general practice, and a brief, direct question (or a validated screener) meaningfully increases detection. Assessment should include medication review, relevant comorbidities, and screening for PTSD and chronic stress.",
      "Erectile dysfunction: PDE5 inhibitors (sildenafil, tadalafil, vardenafil, avanafil) remain first-line for most men. Second-line options are intracavernosal or intraurethral alprostadil and vacuum erection devices, and penile prostheses are reserved for refractory cases. Personalise treatment to patient and partner preference.",
      "Female sexual dysfunction: HSDD is the most common. The recommended approach is biopsychosocial: education and addressing modifiable contributors (pain, arousal difficulties, sleep, depression, medications) first, before hormonal or non-hormonal medication. Flibanserin can be considered for premenopausal women without depression, with counselling on alcohol interaction risk.",
      "Screen actively for medication-induced sexual dysfunction. It affects roughly 30–60% of SSRI users and is under-reported unless asked about directly. Options: wait and monitor if mild, reduce the dose, switch to a lower-risk agent (bupropion, mirtazapine, agomelatine), or augment with bupropion or a PDE5 inhibitor. Check the medication before assuming the mental health condition is the only driver.",
      "The overlap with PTSD is unusually well documented, particularly in veterans: chronic hyperarousal opposes the arousal response, and emotional numbing and avoidance reduce desire. Trauma-focused therapy often improves sexual function as a secondary benefit, and integrated care tends to outperform treating either in isolation. Ask directly, since patients often won't raise it.",
      "Referral for veterans: start with a GP for assessment and RPBS-subsidised PDE5 inhibitors. Gold Card and Orange Card holders can access RPBS medicines for any condition, and White Card holders where the condition (or an underlying accepted condition such as PTSD) is covered. Refer to a urologist or sexual health physician for refractory ED or complex female sexual dysfunction.",
      "Referral for first responders: a GP for assessment and prescription, the employer EAP where stress, shift work or relationship strain seems to contribute, and a psychosexual counsellor or sexual health physician for persistent difficulties.",
    ],
    veteran: [
      "Changes in desire, arousal or performance are common after service, far more common than most people realise, and often connected to PTSD, medications or stress. It's nothing to feel embarrassed about.",
      "For erectile difficulties, tablets like Viagra or Cialis (sildenafil/tadalafil) are the standard starting point and work well for most men. Other options exist if these aren't suitable.",
      "For low desire or arousal difficulties, treatment usually starts with addressing what might be contributing, such as sleep, medications, stress or relationship factors, before considering medication-based options.",
      "Some antidepressants used for PTSD or depression can affect sexual function. There are ways to manage that without necessarily stopping the medication.",
      "Start with your GP. With a Gold Card or Orange Card, medications like sildenafil are subsidised through the RPBS at the normal concession co-payment. With a White Card it may still be covered if it connects to an already-accepted condition like PTSD, so ask your GP. Open Arms (1800 011 046) is a good option if PTSD symptoms or relationship strain are part of what's going on.",
      "This is genuinely common with PTSD, and it isn't a sign that anything is permanently wrong. Treating PTSD symptoms often improves things alongside any specific treatment for the sexual side of it.",
    ],
    firstResponder: [
      "Changes in desire, arousal or performance are common in high-stress occupations, and often connected to shift work, chronic stress or medications. It's nothing to feel embarrassed about.",
      "For erectile difficulties, tablets like Viagra or Cialis (sildenafil/tadalafil) are the standard starting point and work well for most men. Other options exist if these aren't suitable.",
      "For low desire or arousal difficulties, treatment usually starts with addressing what might be contributing, such as sleep, medications, stress or relationship factors, before considering medication-based options.",
      "If you're on an antidepressant for anxiety or depression, it can affect sexual function. There are ways to manage that without necessarily stopping the medication.",
      "Start with your GP. Private health cover often contributes toward specialist referral if needed. Your employer's EAP is a confidential place to raise stress or shift-work factors alongside it.",
      "If ongoing stress, poor sleep or trauma symptoms are part of the picture, addressing those tends to improve things alongside any specific treatment for the sexual side of it, not instead of it.",
    ],
  },
  sources: [
    {
      label:
        "Fifth International Consultation on Sexual Medicine (ICSM 2024) — recommendations on medical management of erectile dysfunction, and on evaluation and management of hypoactive sexual desire disorder in women",
    },
    {
      label:
        "International Society for the Study of Women's Sexual Health — Process of Care for Management of HSDD",
    },
    { label: "ACOG Practice Bulletin — Female Sexual Dysfunction" },
    {
      label:
        "Antidepressant-Induced Sexual Dysfunction in Adults: A Targeted Scoping Review and Clinical Update (2026)",
    },
    {
      label:
        "Yehuda et al., PTSD and Sexual Dysfunction in Men and Women, Journal of Sexual Medicine",
    },
    {
      label:
        "Relationship Between Posttraumatic Stress Disorder and Sexual Difficulties: A Systematic Review of Veterans and Military Personnel (2021)",
    },
    {
      label:
        "Department of Veterans' Affairs — Concessional medicines under the RPBS (DVA website)",
    },
  ],
  related: ["ptsd", "mdd"],
  relatedSpokes: [
    { id: "mind", text: "On how stress and hyperarousal work in the body:" },
  ],
};

// Order shown on the index and in the condition-switcher pills.
export const CONDITIONS: Condition[] = [
  ptsd,
  alcoholAndDrugUse,
  mdd,
  moralInjury,
  chronicPain,
  bruxism,
  sexualDysfunction,
];

export function getCondition(slug: string): Condition | undefined {
  return CONDITIONS.find((c) => c.slug === slug);
}

export type ConditionAudience = "veteran" | "firstResponder" | "clinician";
