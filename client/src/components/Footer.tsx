import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="mt-12 text-center text-sm text-white/50 pb-8">
      <p>Proof of Vibes - NFT Memories on Solana</p>
      <div className="flex justify-center space-x-4 mt-2">
        <Link href="#terms">
          <a className="hover:text-white transition-colors">Terms</a>
        </Link>
        <Link href="#privacy">
          <a className="hover:text-white transition-colors">Privacy</a>
        </Link>
        <Link href="#help">
          <a className="hover:text-white transition-colors">Help</a>
        </Link>
      </div>
    </footer>
  );
}
