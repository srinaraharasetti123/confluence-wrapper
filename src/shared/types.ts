interface SpaceSummary {
  id: string;
  name: string;
  description: string;
  type: 'shared_drive' | 'folder';
  docCount?: number;
}

interface SpaceDetail extends SpaceSummary {
  items: PageNode[];
}

interface PageNode {
  id: string;
  name: string;
  mimeType: string;
  parentId: string;
  modifiedTime: string;
  modifiedBy: string;
  hasChildren: boolean;
  webViewLink: string;
  iconLink?: string;
}

interface PageDetail {
  id: string;
  name: string;
  mimeType: string;
  description: string;
  modifiedTime: string;
  modifiedBy: string;
  createdTime: string;
  webViewLink: string;
  thumbnailLink?: string;
  breadcrumb: BreadcrumbItem[];
  tags: string[];
  starred: boolean;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface SearchResult {
  id: string;
  name: string;
  mimeType: string;
  snippet: string;
  modifiedTime: string;
  modifiedBy: string;
  webViewLink: string;
  breadcrumb: BreadcrumbItem[];
}

interface TagCount {
  tag: string;
  count: number;
}

interface ActivityItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  modifiedBy: string;
  modifiedByPhoto?: string;
  webViewLink: string;
  spaceName?: string;
}

interface SpaceConfig {
  id: string;
  name: string;
  type: 'shared_drive' | 'folder';
  description?: string;
}
