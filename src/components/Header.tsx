'use client';

import Image from 'next/image';
import logo from '@/public/logo.png';

export default function Header() {
  return (
    <header className="bg-secondary p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Image src={logo} alt="B&T Glass, Inc. Logo" width={50} height={50} className="mr-4" />
        <div>
          <h1 className="text-xl font-bold">B&T Glass, Inc.</h1>
        </div>
      </div>
      <div>
        <p>(575) 443-6261</p>
      </div>
    </header>
  );
}
