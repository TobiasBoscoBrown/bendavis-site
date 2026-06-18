import TabPage, { tabMetadata } from '@/components/TabPage';
export async function generateMetadata() { return tabMetadata('modeling'); }
export default function Page() { return <TabPage pageKey="modeling" />; }
