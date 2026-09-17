import { Component, OnInit } from '@angular/core';

interface PlanTile {
  name: string;
  price: number;
  period: string;
  tagline: string;
  popular?: boolean;
  current?: boolean;
  features: string[];
}

@Component({
  selector: 'app-packages-billing',
  templateUrl: './packages-billing.component.html',
  styleUrls: ['./packages-billing.component.css'],
})
export class PackagesBillingComponent implements OnInit {
  tab: 'plans' | 'billing' | 'invoices' = 'plans';

  plans: PlanTile[] = [
    {
      name: 'Free Plan',
      tagline: 'Get started with the basics.',
      price: 0,
      period: 'forever',
      current: true,
      features: [
        'List limited ads',
        'Basic business profile',
        'Standard visibility',
        'Access to core features',
      ],
    },
    // {
    //   name: 'Pro Plan',
    //   tagline: 'For growing individuals and small businesses.',
    //   price: 499,
    //   period: '/ month',
    //   popular: true,
    //   features: [
    //     'List unlimited ads',
    //     'Enhanced business profile',
    //     'Higher visibility',
    //     'Priority support',
    //     'Access to analytics',
    //   ],
    // },
    // {
    //   name: 'Business Plan',
    //   tagline: 'For established businesses with higher reach.',
    //   price: 999,
    //   period: '/ month',
    //   features: [
    //     'Everything in Pro Plan',
    //     'Featured listings',
    //     'Advanced analytics',
    //     'Multiple business profiles',
    //     'Priority support',
    //     'Dedicated account manager',
    //   ],
    // },
  ];

  ngOnInit(): void {}

  planIcon(name: string): string {
    if (name.includes('Free')) return 'send';
    if (name.includes('Pro')) return 'workspace_premium';
    return 'business_center';
  }
}
