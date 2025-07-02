export interface SidebarMenuItem {
  key: string;
  label: string;
}

export const sidebarMenuData: SidebarMenuItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'api', label: 'API Reference' },
  { key: 'faq', label: 'FAQ' },
]; 