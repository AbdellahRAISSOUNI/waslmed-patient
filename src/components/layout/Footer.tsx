import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Link href="/" className="flex items-center justify-center">
            <div className="relative h-8 w-32 flex items-center justify-center">
              <Image 
                src="/images/logo.png" 
                alt="WaslMed Logo" 
                width={100} 
                height={32}
                className="object-contain max-h-8"
              />
            </div>
          </Link>
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} WaslMed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 