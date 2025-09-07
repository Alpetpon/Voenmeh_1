import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import TourGrid from '@/components/TourGrid';
import { Advantages } from '@/components/Advantages';
import Partners from '@/components/Partners';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow bg-white">
        <SearchForm />
        <TourGrid />
        <Advantages />
        <Partners />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}