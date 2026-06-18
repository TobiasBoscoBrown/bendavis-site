import TabPage, { tabMetadata } from '@/components/TabPage';
export async function generateMetadata() { return tabMetadata('acting'); }
export default function Page() { return <TabPage pageKey="acting" />; }
