export interface FrameworkModule {
  id: string;
  title: string;
  icon: string;
  progress: number;
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
  module_id: string;
  completed: number;
  total: number;
  business_id: string;
}

export const FRAMEWORK_MODULES: FrameworkModule[] = [
  {
    id: 'ideation',
    title: 'Ideation & Validation',
    icon: 'Lightbulb',
    progress: 30,
    description: 'Problem-Solution Fit, VPC, Market Sizing.',
    path: '/ideation'
  },
  {
    id: 'blueprint',
    title: 'The Blueprint',
    icon: 'Map',
    progress: 10,
    description: 'Dynamic BMC, SOP Digital, HR Key Resources.',
    path: '/blueprint'
  },
  {
    id: 'communication',
    title: 'External Communication',
    icon: 'MessageSquare',
    progress: 0,
    description: 'Company Profile, Pitch Deck, Data Visualization.',
    path: '/communication'
  },
  {
    id: 'execution',
    title: 'Execution & Finance',
    icon: 'TrendingUp',
    progress: 45,
    description: 'Leads Engine, Financial Tracker.',
    path: '/execution'
  },
  {
    id: 'growth',
    title: 'Sustainability & Growth',
    icon: 'Rocket',
    progress: 5,
    description: 'SEO Roadmap, Innovation.',
    path: '/growth'
  },
  {
    id: 'risk',
    title: 'Risk Management',
    icon: 'ShieldAlert',
    progress: 0,
    description: 'ERM & Analysis.',
    path: '/risk'
  }
];
