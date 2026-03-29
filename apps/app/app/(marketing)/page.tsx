import {
  CTA,
  Features,
  Footer,
  Header,
  Hero,
  Pricing,
  SocialProof,
  Testimonials,
  Workflow,
} from "./_components";

const HomePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-16">
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <Workflow />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  </div>
);

export default HomePage;
