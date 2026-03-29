import {
  CTA,
  Features,
  Footer,
  Header,
  Hero,
  Testimonials,
  Workflow,
} from "./_components";

const HomePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-16">
      <Header />
      <Hero />
      <Features />
      <Workflow />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  </div>
);

export default HomePage;
