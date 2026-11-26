import {
  LayoutDashboard, Users, Target, Kanban, CalendarCheck, Mail,
  Brain, Sparkles, BarChart3, UserCog, Settings,
} from 'lucide-react';

export const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', to: '/customers', icon: Users, module: 'Module 3' },
  { label: 'Leads', to: '/leads', icon: Target, module: 'Module 4' },
  { label: 'Sales Pipeline', to: '/pipeline', icon: Kanban, module: 'Module 5' },
  { label: 'Activities & Tasks', to: '/activities', icon: CalendarCheck, module: 'Module 6' },
  { label: 'Communication', to: '/communication', icon: Mail, module: 'Module 7' },
  { label: 'Customer Intelligence', to: '/intelligence', icon: Brain, module: 'Module 8' },
  { label: 'AI Sales Assistant', to: '/ai-assistant', icon: Sparkles, module: 'Module 9' },
  { label: 'Reports & Analytics', to: '/reports', icon: BarChart3, module: 'Module 12' },
  { label: 'Team Management', to: '/team', icon: UserCog, roles: ['admin'] },
  { label: 'Settings', to: '/settings', icon: Settings, module: 'a later module' },
];