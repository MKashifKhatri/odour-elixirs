export type FAQItem = { question: string; answer: string };
export type Testimonial = { name: string; location: string; quote: string };
export type BrandPoint = { title: string; description: string };
export type HouseStat = { value: string; label: string };
export type CraftStep = { number: string; title: string; description: string };
export type SiteContent = {
  seoTitle: string; seoDescription: string; heroEyebrow: string; heroTitle: string; heroDescription: string; heroImage: string;
  primaryCta: string; secondaryCta: string; announcement: string; collectionEyebrow: string; collectionTitle: string; collectionDescription: string;
  storyEyebrow: string; storyTitle: string; storyDescription: string; storyImage: string; storyCardOne: string; storyCardTwo: string;
  brandPointsEyebrow: string; brandPointsTitle: string; testimonialEyebrow: string; testimonialTitle: string; faqEyebrow: string; faqTitle: string;
  ctaEyebrow: string; ctaTitle: string; ctaDescription: string; ctaButtonLabel: string; faqActionLabel: string; storyLinkLabel: string;
  helpTitle: string; helpDescription: string; footerTagline: string; whatsappNumber: string; brandPoints: BrandPoint[];
  aboutEyebrow: string; aboutTitle: string; aboutTitleAccent: string; aboutDescription: string; aboutCta: string;
  aboutValueOneTitle: string; aboutValueOneText: string; aboutValueTwoTitle: string; aboutValueTwoText: string; aboutValueThreeTitle: string; aboutValueThreeText: string;
  productsEyebrow: string; productsTitle: string; productsDescription: string;
  contactEyebrow: string; contactTitle: string; contactDescription: string; contactButtonLabel: string; contactCardEyebrow: string; businessAddress: string;
  showStory: boolean; showBrandPoints: boolean; showTestimonials: boolean; showFaq: boolean; showClosingCta: boolean; faq: FAQItem[]; testimonials: Testimonial[];
  discoveryEyebrow: string; discoveryTitle: string; craftEyebrow: string; craftTitle: string; craftDescription: string;
  newsletterEyebrow: string; newsletterTitle: string; newsletterButtonLabel: string;
  showDiscovery: boolean; showCraft: boolean; showNewsletter: boolean; houseStats: HouseStat[]; craftSteps: CraftStep[];
};

export const defaultSiteContent: SiteContent = {
  seoTitle: "Odour Elixirs | Fragrance for Your Own Kind of Presence",
  seoDescription: "Thoughtfully composed fragrances with character, warmth and a memorable trail. Discover Odour Elixirs and find a scent that feels like you.",
  aboutEyebrow: "The Odour Elixirs story",
  aboutTitle: "A fragrance is more than a note.",
  aboutTitleAccent: "It is a feeling that stays.",
  aboutDescription: "Personal fragrances, made to express who you are.",
  aboutCta: "Explore the collection",
  aboutValueOneTitle: "A scent with a point of view",
  aboutValueOneText: "Distinctive fragrances with a point of view.",
  aboutValueTwoTitle: "Made for real moments",
  aboutValueTwoText: "Made for everyday rituals and moments worth remembering.",
  aboutValueThreeTitle: "Personal guidance",
  aboutValueThreeText: "Tell us what you love. We’ll help you find your scent.",
  productsEyebrow: "The collection",
  productsTitle: "Find your fragrance.",
  productsDescription: "A collection of personal fragrances.",
  contactEyebrow: "Contact",
  contactTitle: "We’re here to help.",
  contactDescription: "Fragrance advice or order help? Message us on WhatsApp.",
  contactButtonLabel: "Message us",
  contactCardEyebrow: "Contact details",
  businessAddress: "Gujarat, India",
  heroEyebrow: "Odour Elixirs · Fine fragrance",
  heroTitle: "THE ART OF\nLEAVING A TRACE.",
  heroDescription: "Fragrance that feels like you.",
  heroImage: "/brand/oe-campaign-hero.jpg",
  primaryCta: "Explore fragrances",
  secondaryCta: "Discover the house",
  announcement: "Personal fragrance guidance",
  collectionEyebrow: "The collection",
  collectionTitle: "Find your signature.",
  collectionDescription: "Find a scent that feels like you.",
  storyEyebrow: "A scent, a feeling",
  storyTitle: "More than a final detail.",
  storyDescription: "Personal fragrances, made to leave a lasting impression.",
  storyImage: "",
  storyCardOne: "Notes that draw you in.",
  storyCardTwo: "A signature that stays.",
  brandPointsEyebrow: "The feeling, in every detail",
  brandPointsTitle: "A little more personal.",
  testimonialEyebrow: "Notes from our customers",
  helpTitle: "Need help choosing a fragrance?",
  helpDescription: "Talk with us directly. We’ll help you find a scent that feels right.",
  footerTagline: "A scent that stays with you.",
  whatsappNumber: "919427868790",
  brandPoints: [
    { title: "Thoughtfully composed", description: "Distinctive notes, balanced to feel beautiful from the first spray to the final impression." },
    { title: "Made to feel personal", description: "Explore fresh, floral and warm profiles until you find the one that feels like you." },
    { title: "A real conversation", description: "Ask us for a recommendation and place your request directly on WhatsApp." },
  ],
  testimonialTitle: "Experiences with Odour Elixirs",
  faqEyebrow: "A little clarity",
  faqTitle: "Good to know.",
  ctaEyebrow: "Your story, in scent",
  ctaTitle: "Your next signature scent awaits.",
  ctaDescription: "Tell us what you like. We’ll help you find it.",
  ctaButtonLabel: "Find your fragrance on WhatsApp",
  faqActionLabel: "Ask us directly",
  storyLinkLabel: "Discover our story",
  showStory: true,
  showBrandPoints: false,
  showTestimonials: false,
  showFaq: true,
  showClosingCta: false,
  discoveryEyebrow: "Find your family",
  discoveryTitle: "Find your scent family.",
  craftEyebrow: "The composition",
  craftTitle: "The craft behind the scent.",
  craftDescription: "A considered composition, from its first impression to the final trace.",
  newsletterEyebrow: "Letters from the house",
  newsletterTitle: "A note from the house.",
  newsletterButtonLabel: "Subscribe",
  showDiscovery: true,
  showCraft: false,
  showNewsletter: true,
  houseStats: [],
  craftSteps: [
    { number: "01", title: "The oil", description: "A fragrance begins with a selection of notes that set its first impression." },
    { number: "02", title: "The blend", description: "Contrasting materials meet and find a character that feels distinctly its own." },
    { number: "03", title: "The balance", description: "The opening, heart and base are considered as one evolving composition." },
    { number: "04", title: "The trace", description: "The final impression is the one that stays with you after the moment has passed." },
  ],
  faq: [
    { question: "How do I place an order?", answer: "Add the fragrances you like to your bag, share your contact and delivery details, and send the request to us on WhatsApp. We’ll confirm availability, delivery and the final amount with you." },
    { question: "Can I order without creating an account?", answer: "Yes. You can continue as a guest. If you create an account, your saved details can make future requests quicker on the same device." },
    { question: "Do you take payment on the website?", answer: "No. There is no payment gateway on this website. We’ll discuss payment directly with you on WhatsApp after confirming your request." },
    { question: "Can you help me choose a fragrance?", answer: "Of course. Message us on WhatsApp with the kinds of scents or notes you enjoy, and we’ll help you explore the collection." },
    { question: "How long does a fragrance last?", answer: "Wear time varies with the fragrance, your skin and the conditions around you. Message us about a specific scent and we’ll share the details available for it." },
    { question: "What concentration do you use?", answer: "Concentration details can vary by product. Message us about a specific fragrance and we’ll confirm the information available before you order." },
    { question: "What sizes are available?", answer: "The available sizes are shown on each product page. We can confirm current availability with you on WhatsApp." },
    { question: "How should I store my fragrance?", answer: "Keep the bottle closed and away from direct sunlight and excess heat. Contact us if you need product-specific care guidance." },
    { question: "Do you ship across India?", answer: "Share your PIN code with us on WhatsApp and we’ll confirm delivery availability and timing for your location." },
    { question: "What is your return policy?", answer: "We’ll explain the applicable return terms directly on WhatsApp before confirming your order request." },
  ],
  testimonials: [],
};
