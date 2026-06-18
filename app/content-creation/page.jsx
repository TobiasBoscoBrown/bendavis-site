import TabPage, { tabMetadata } from '@/components/TabPage';
export async function generateMetadata() { return tabMetadata('content-creation'); }
export default function Page() { return <TabPage pageKey="content-creation" />; }
