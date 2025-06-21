'use client';
import Chatbot from '@/components/Chatbot';
import { Analytics } from "@vercel/analytics/next"
import Head from 'next/head';
export default function Page() {
  <Head>
        <title>What would my Pastor say?</title>
  <Analytics />
  </Head>
  return <Chatbot />;
}
