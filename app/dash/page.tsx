import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import PinGate from '@/components/PinGate';
import DashboardStats from '@/components/DashboardStats';

export const metadata = {
  title: 'Dashboard | GitLeak Finder',
};

async function verifySession() {
  const cookieStore = cookies();
  const token = cookieStore.get('dash_session')?.value;
  
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(
      process.env.DASH_SECRET || 'fallback_secret_for_dev_only_please_change'
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export default async function DashPage() {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    return <PinGate />;
  }

  return <DashboardStats />;
}
