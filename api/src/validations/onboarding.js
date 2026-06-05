import { z } from 'zod';

const HeroSection = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  backgroundImage: z.string().optional(),
});

const ServiceItem = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  price: z.string().optional(),
});

const FaqItem = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
});

const SocialLinks = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
});

const Branding = z.object({
  businessName: z.string().optional(),
  description: z.string().optional(),
  primary: z.string().optional(),
  accent: z.string().optional(),
});

const Products = z.record(z.unknown());

const OnboardingData = z.object({
  hero: HeroSection.optional(),
  services: z.array(ServiceItem).optional(),
  products: Products.optional(),
  faq: z.array(FaqItem).optional(),
  socialLinks: SocialLinks.optional(),
  branding: Branding.optional(),
  intro_accepted: z.boolean().optional(),
});

export const SaveOnboardingSchema = z.object({
  data: OnboardingData,
});
