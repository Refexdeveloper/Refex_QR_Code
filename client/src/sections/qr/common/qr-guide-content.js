export const QR_GUIDES = {
  fixedUrl: {
    id: 'fixed-url',
    title: 'Fixed URL QR Codes',
    subtitle: 'Create permanent QR codes that always open the same destination.',
    accent: '#0F6E8C',
    accentSoft: 'rgba(15, 110, 140, 0.10)',
    accentBorder: 'rgba(15, 110, 140, 0.22)',
    icon: 'solar:link-bold-duotone',
    heroIcon: 'solar:qr-code-bold-duotone',
    overview:
      'Use Fixed URL when the destination will not change. Ideal for print materials, packaging, and long-lived campaigns where consistency matters.',
    steps: [
      {
        title: 'Create a code',
        description: 'Enter the full destination URL or plain text you want the QR to encode.',
        icon: 'solar:add-circle-bold-duotone',
      },
      {
        title: 'Download & place',
        description: 'Download the QR image and place it on posters, labels, emails, or product packaging.',
        icon: 'solar:download-minimalistic-bold-duotone',
      },
      {
        title: 'Scan anytime',
        description: 'Anyone who scans the code is taken directly to the same fixed destination.',
        icon: 'solar:smartphone-2-bold-duotone',
      },
    ],
    useCases: [
      {
        title: 'Product packaging',
        description: 'Link customers to a permanent product page, warranty form, or support portal.',
        icon: 'solar:box-bold-duotone',
      },
      {
        title: 'Office signage',
        description: 'Print QR codes for Wi-Fi guides, visitor forms, or building directories.',
        icon: 'solar:buildings-2-bold-duotone',
      },
      {
        title: 'Business cards',
        description: 'Share your LinkedIn profile, company website, or digital portfolio with a lasting code.',
        icon: 'solar:card-bold-duotone',
      },
      {
        title: 'Compliance labels',
        description: 'Point scanners to fixed policy documents, safety datasheets, or certificate pages.',
        icon: 'solar:document-text-bold-duotone',
      },
    ],
    tip: 'Choose Fixed URL only when the destination is final. If the link may change later, use Dynamic URL instead.',
  },

  dynamicUrl: {
    id: 'dynamic-url',
    title: 'Dynamic URL QR Codes',
    subtitle: 'Print once, update the destination anytime without reprinting.',
    accent: '#1B7F5A',
    accentSoft: 'rgba(27, 127, 90, 0.10)',
    accentBorder: 'rgba(27, 127, 90, 0.22)',
    icon: 'solar:refresh-circle-bold-duotone',
    heroIcon: 'solar:route-bold-duotone',
    overview:
      'Dynamic URL QR codes keep a stable public scan link while letting you change the destination behind it. Perfect for campaigns that evolve over time.',
    steps: [
      {
        title: 'Create & set target',
        description: 'Generate a QR with an initial destination URL that users will visit after scanning.',
        icon: 'solar:add-circle-bold-duotone',
      },
      {
        title: 'Print the QR',
        description: 'Download and print the code. The printed image never needs to change.',
        icon: 'solar:printer-bold-duotone',
      },
      {
        title: 'Update anytime',
        description: 'Edit the destination URL later—existing prints and scans automatically follow the new link.',
        icon: 'solar:pen-new-square-bold-duotone',
      },
    ],
    useCases: [
      {
        title: 'Seasonal campaigns',
        description: 'Reuse the same poster QR for Diwali, New Year, and summer offers by updating the target.',
        icon: 'solar:calendar-bold-duotone',
      },
      {
        title: 'Event landing pages',
        description: 'Switch from registration to agenda to feedback forms as the event progresses.',
        icon: 'solar:ticket-bold-duotone',
      },
      {
        title: 'Menu & catalogs',
        description: 'Update restaurant menus or product catalogs without reprinting table stickers.',
        icon: 'solar:notebook-bold-duotone',
      },
      {
        title: 'Retail promotions',
        description: 'Point shelf QR codes to the latest offer page without changing packaging artwork.',
        icon: 'solar:tag-price-bold-duotone',
      },
    ],
    tip: 'Keep one Dynamic QR for each physical placement. Update the destination when the campaign changes—never reprint unless the design itself changes.',
  },

  uploadFile: {
    id: 'upload-file',
    title: 'Upload File QR Codes',
    subtitle: 'Share PDFs, images, and documents instantly through a scannable QR.',
    accent: '#C45C26',
    accentSoft: 'rgba(196, 92, 38, 0.10)',
    accentBorder: 'rgba(196, 92, 38, 0.22)',
    icon: 'solar:file-bold-duotone',
    heroIcon: 'solar:cloud-upload-bold-duotone',
    overview:
      'Upload a file once and generate a QR that opens or downloads it. Useful when you need to distribute documents without email attachments or shared drives.',
    steps: [
      {
        title: 'Upload your file',
        description: 'Choose a PDF, image, or supported document and set access preferences.',
        icon: 'solar:upload-bold-duotone',
      },
      {
        title: 'Generate the QR',
        description: 'The system creates a public scan link and a downloadable QR image for that file.',
        icon: 'solar:qr-code-bold-duotone',
      },
      {
        title: 'Share securely',
        description: 'Place the QR in emails, notices, or printouts so recipients can open the file immediately.',
        icon: 'solar:share-bold-duotone',
      },
    ],
    useCases: [
      {
        title: 'Brochures & datasheets',
        description: 'Let visitors download product brochures from exhibition stalls or reception desks.',
        icon: 'solar:book-bold-duotone',
      },
      {
        title: 'HR & onboarding packs',
        description: 'Share policy manuals, offer letters, or induction PDFs with new joiners.',
        icon: 'solar:users-group-rounded-bold-duotone',
      },
      {
        title: 'Training materials',
        description: 'Distribute presentation decks, SOPs, or checklists during workshops.',
        icon: 'solar:diploma-bold-duotone',
      },
      {
        title: 'Invoice & certificates',
        description: 'Provide a scannable way to retrieve invoices, warranties, or completion certificates.',
        icon: 'solar:bill-list-bold-duotone',
      },
    ],
    tip: 'Prefer Upload File when the content is a document. If you only need to open a webpage, Fixed or Dynamic URL is a better fit.',
  },

  smartLink: {
    id: 'smart-link',
    title: 'Smart Link QR Codes',
    subtitle: 'Send scanners to the right place based on device, platform, or context.',
    accent: '#2F5B9A',
    accentSoft: 'rgba(47, 91, 154, 0.10)',
    accentBorder: 'rgba(47, 91, 154, 0.22)',
    icon: 'solar:tuning-2-bold-duotone',
    heroIcon: 'solar:devices-bold-duotone',
    overview:
      'Smart Link QR codes route users intelligently—for example to an App Store on iPhone and Play Store on Android—from a single printed code.',
    steps: [
      {
        title: 'Define destinations',
        description: 'Configure the links for each platform or fallback destination you want to support.',
        icon: 'solar:settings-bold-duotone',
      },
      {
        title: 'Create one QR',
        description: 'Generate a single Smart Link QR that represents all of those destinations.',
        icon: 'solar:qr-code-bold-duotone',
      },
      {
        title: 'Automatic routing',
        description: 'When scanned, the system detects context and redirects to the most suitable link.',
        icon: 'solar:routing-2-bold-duotone',
      },
    ],
    useCases: [
      {
        title: 'App downloads',
        description: 'One QR for both iOS App Store and Google Play, with a web fallback for desktops.',
        icon: 'solar:smartphone-bold-duotone',
      },
      {
        title: 'Multi-region campaigns',
        description: 'Route users in different regions to localized landing pages from the same print.',
        icon: 'solar:global-bold-duotone',
      },
      {
        title: 'Support triage',
        description: 'Send mobile users to a chat bot and desktop users to a detailed help center.',
        icon: 'solar:chat-round-call-bold-duotone',
      },
      {
        title: 'Partner referrals',
        description: 'Direct scanners to partner-specific pages while keeping a single brand QR design.',
        icon: 'solar:handshake-bold-duotone',
      },
    ],
    tip: 'Always configure a clear fallback URL so desktop or unrecognized devices still land somewhere useful.',
  },

  designQr: {
    id: 'design-qr',
    title: 'Design QR Studio',
    subtitle: 'Brand your QR codes with colors, shapes, logos, and visual styles.',
    accent: '#7A4E2D',
    accentSoft: 'rgba(122, 78, 45, 0.10)',
    accentBorder: 'rgba(122, 78, 45, 0.22)',
    icon: 'solar:palette-bold-duotone',
    heroIcon: 'solar:gallery-bold-duotone',
    overview:
      'Design QR lets you customize appearance—foreground/background colors, corner styles, eye patterns, and logos—while keeping the code scannable and on-brand.',
    steps: [
      {
        title: 'Start from content',
        description: 'Enter the URL or value the QR should encode, just like a standard QR.',
        icon: 'solar:text-bold-duotone',
      },
      {
        title: 'Style the code',
        description: 'Adjust colors, shapes, quiet zone, and optional logo to match brand guidelines.',
        icon: 'solar:palette-bold-duotone',
      },
      {
        title: 'Preview & export',
        description: 'Preview scannability, then download a high-quality image for print or digital use.',
        icon: 'solar:export-bold-duotone',
      },
    ],
    useCases: [
      {
        title: 'Brand campaigns',
        description: 'Match QR aesthetics to campaign creatives for posters, banners, and social posts.',
        icon: 'solar:gallery-favourite-bold-duotone',
      },
      {
        title: 'Corporate stationery',
        description: 'Add company-colored QR codes to letterheads, ID cards, and visitor badges.',
        icon: 'solar:letter-bold-duotone',
      },
      {
        title: 'Retail packaging',
        description: 'Produce on-brand QR artwork that fits packaging colorways without looking generic.',
        icon: 'solar:bag-4-bold-duotone',
      },
      {
        title: 'Event branding',
        description: 'Create themed QR designs for conferences, townhalls, and launch events.',
        icon: 'solar:star-bold-duotone',
      },
    ],
    tip: 'Keep strong contrast between foreground and background, and avoid oversized logos that cover the QR modules—scannability always comes first.',
  },
};
