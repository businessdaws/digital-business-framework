export interface FrameworkModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  timestamp: string;
  user_email: string;
  created_at: string;
}

export interface ModuleProgress {
  module_key: string;
  completed_tasks: number;
  total_tasks: number;
  business_id: string;
}

export const FRAMEWORK_MODULES: FrameworkModule[] = [
  {
    id: 'ideation',
    title: 'Ideation & Validation',
    icon: 'Lightbulb',
    description: 'Problem-Solution Fit, VPC, Market Sizing.',
    path: '/ideation'
  },
  {
    id: 'blueprint',
    title: 'The Blueprint',
    icon: 'Map',
    description: 'Dynamic BMC, SOP Digital, HR Key Resources.',
    path: '/blueprint'
  },
  {
    id: 'communication',
    title: 'External Communication',
    icon: 'MessageSquare',
    description: 'Company Profile, Pitch Deck, Data Visualization.',
    path: '/communication'
  },
  {
    id: 'execution',
    title: 'Execution & Finance',
    icon: 'TrendingUp',
    description: 'Leads Engine, Financial Tracker.',
    path: '/execution'
  },
  {
    id: 'growth',
    title: 'Sustainability & Growth',
    icon: 'Rocket',
    description: 'SEO Roadmap, Innovation.',
    path: '/growth'
  },
  {
    id: 'risk',
    title: 'Risk Management',
    icon: 'ShieldAlert',
    description: 'ERM & Analysis.',
    path: '/risk'
  }
];
