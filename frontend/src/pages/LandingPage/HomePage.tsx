
import Footer from './Sections/Footer';
import First from './Sections/FirstSection';
import SixthSection from './Sections/SixthSection';
import EightSection from './Sections/EightSection';
import FifthSection from './Sections/FifthSection';
import SecondSection from './Sections/SecondSection';
import FourthSection from './Sections/FourthSection';
import SeventhSection from './Sections/SeventhSection';
import MarqueeSection from '@/components/common/marquee';
const Home = () => {
  return (
    <>
      <First />
      <SecondSection/>
      <MarqueeSection/>
      <FourthSection/>
      <FifthSection/>
      <SixthSection/>
      <SeventhSection/>
      <EightSection/>
      <Footer/>
    </>
  );
};

export default Home;
