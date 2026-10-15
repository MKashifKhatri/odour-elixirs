-- Run once after the base schema and odour-elixirs-migration.sql.
-- Adds new homepage fields without overwriting existing administrator edits.
update public.site_content
set content = content || jsonb_build_object(
  'aboutEyebrow', coalesce(content->'aboutEyebrow', to_jsonb('The Odour Elixirs story'::text)),
  'aboutTitle', coalesce(content->'aboutTitle', to_jsonb('A fragrance is more than a note.'::text)),
  'aboutTitleAccent', coalesce(content->'aboutTitleAccent', to_jsonb('It is a feeling that stays.'::text)),
  'aboutDescription', coalesce(content->'aboutDescription', to_jsonb('Odour Elixirs is built around the belief that the right fragrance becomes part of how you move through the world: personal, memorable and unmistakably yours.'::text)),
  'aboutCta', coalesce(content->'aboutCta', to_jsonb('Explore the collection'::text)),
  'aboutValueOneTitle', coalesce(content->'aboutValueOneTitle', to_jsonb('A scent with a point of view'::text)),
  'aboutValueOneText', coalesce(content->'aboutValueOneText', to_jsonb('We create expressive fragrances designed to feel personal, considered and easy to make your own.'::text)),
  'aboutValueTwoTitle', coalesce(content->'aboutValueTwoTitle', to_jsonb('Made for real moments'::text)),
  'aboutValueTwoText', coalesce(content->'aboutValueTwoText', to_jsonb('From the everyday ritual to the occasion you have been looking forward to, fragrance belongs to your story.'::text)),
  'aboutValueThreeTitle', coalesce(content->'aboutValueThreeTitle', to_jsonb('Personal guidance'::text)),
  'aboutValueThreeText', coalesce(content->'aboutValueThreeText', to_jsonb('Not sure where to begin? Talk to us directly and we will help you find a scent that feels right.'::text)),
  'productsEyebrow', coalesce(content->'productsEyebrow', to_jsonb('The Odour Elixirs collection'::text)),
  'productsTitle', coalesce(content->'productsTitle', to_jsonb('A fragrance for every version of you.'::text)),
  'productsDescription', coalesce(content->'productsDescription', to_jsonb('Explore fine fragrances shaped by the notes and moods you return to.'::text)),
  'contactEyebrow', coalesce(content->'contactEyebrow', to_jsonb('We are here to help'::text)),
  'contactTitle', coalesce(content->'contactTitle', to_jsonb('Good fragrance starts with a good conversation.'::text)),
  'contactDescription', coalesce(content->'contactDescription', to_jsonb('Ask us about a fragrance, check on an order or get a personal recommendation. We will reply directly on WhatsApp.'::text)),
  'contactButtonLabel', coalesce(content->'contactButtonLabel', to_jsonb('Message us on WhatsApp'::text)),
  'contactCardEyebrow', coalesce(content->'contactCardEyebrow', to_jsonb('Contact details'::text)),
  'businessAddress', coalesce(content->'businessAddress', to_jsonb('Gujarat, India'::text)),
  'storyImage', coalesce(content->'storyImage', to_jsonb('/brand/bottle-rose.svg'::text)),
  'collectionEyebrow', coalesce(content->'collectionEyebrow', to_jsonb('The collection'::text)),
  'storyEyebrow', coalesce(content->'storyEyebrow', to_jsonb('A scent, a feeling'::text)),
  'brandPointsEyebrow', coalesce(content->'brandPointsEyebrow', to_jsonb('The feeling, in every detail'::text)),
  'brandPointsTitle', coalesce(content->'brandPointsTitle', to_jsonb('A little more personal.'::text)),
  'testimonialEyebrow', coalesce(content->'testimonialEyebrow', to_jsonb('Notes from our customers'::text)),
  'faqEyebrow', coalesce(content->'faqEyebrow', to_jsonb('A little clarity'::text)),
  'ctaEyebrow', coalesce(content->'ctaEyebrow', to_jsonb('Your story, in scent'::text)),
  'ctaButtonLabel', coalesce(content->'ctaButtonLabel', to_jsonb('Find your fragrance on WhatsApp'::text)),
  'faqActionLabel', coalesce(content->'faqActionLabel', to_jsonb('Ask us directly'::text)),
  'storyLinkLabel', coalesce(content->'storyLinkLabel', to_jsonb('Discover our story'::text)),
  'showStory', coalesce(content->'showStory', 'true'::jsonb),
  'showBrandPoints', coalesce(content->'showBrandPoints', 'true'::jsonb),
  'showTestimonials', coalesce(content->'showTestimonials', 'true'::jsonb),
  'showFaq', coalesce(content->'showFaq', 'true'::jsonb),
  'showClosingCta', coalesce(content->'showClosingCta', 'true'::jsonb),
  'brandPoints', coalesce(content->'brandPoints', jsonb_build_array(
    jsonb_build_object('title', 'Thoughtfully composed', 'description', 'Distinctive notes, balanced to feel beautiful from the first spray to the final impression.'),
    jsonb_build_object('title', 'Made to feel personal', 'description', 'Explore fresh, floral and warm profiles until you find the one that feels like you.'),
    jsonb_build_object('title', 'A real conversation', 'description', 'Ask us for a recommendation and place your request directly on WhatsApp.')
  )),
  'testimonialTitle', coalesce(content->'testimonialTitle', to_jsonb('In their own words.'::text)),
  'footerTagline', coalesce(content->'footerTagline', to_jsonb('Fragrance for the moments you want remembered.'::text)),
  'faqTitle', coalesce(content->'faqTitle', to_jsonb('A few things worth knowing.'::text)),
  'ctaTitle', coalesce(content->'ctaTitle', to_jsonb('Your next signature is closer than you think.'::text)),
  'ctaDescription', coalesce(content->'ctaDescription', to_jsonb('Tell us what you love, and we will help you find a fragrance to make your own.'::text)),
  'faq', case
    when coalesce(content->'faq', '[]'::jsonb) = '[]'::jsonb then jsonb_build_array(
      jsonb_build_object('question', 'How do I place an order?', 'answer', 'Add fragrances to your bag, share your contact and delivery details, and send the request to us on WhatsApp. We will confirm availability, delivery and the final amount with you.'),
      jsonb_build_object('question', 'Can I order without creating an account?', 'answer', 'Yes. You can continue as a guest. If you create an account, your saved details can make future requests quicker on the same device.'),
      jsonb_build_object('question', 'Do you take payment on the website?', 'answer', 'No. There is no payment gateway on this website. We will discuss payment directly with you on WhatsApp after confirming your request.'),
      jsonb_build_object('question', 'Can you help me choose a fragrance?', 'answer', 'Of course. Message us on WhatsApp with the kinds of scents or notes you enjoy, and we will help you explore the collection.')
    )
    else content->'faq'
  end
)
where id = 'storefront';
