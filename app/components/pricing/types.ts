export interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel?: string;
  period: string;
  periodSubtext?: string;
  badge?: string;
  featured?: boolean;
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  features: PricingFeature[];
  productId?: string;
  slug?: string;
}

export interface PricingConfig {
  label?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}
