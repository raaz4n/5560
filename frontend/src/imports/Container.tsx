import svgPaths from "./svg-5vinx5hakt";
import imgGabrielSollmannY7D2657I08Unsplash1 from "figma:asset/1872b72a551730b4ff9b087199a02759c42a6fc1.png";
import imgImage1 from "figma:asset/20f7cedb03dddba5130a763226504ec61eca2864.png";

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center leading-[0] not-italic relative shrink-0 text-center w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center min-w-full relative shrink-0 text-[64px] text-black tracking-[-1.6px] w-[min-content]">
        <h1 className="block leading-[1.1]">MetaBooks</h1>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[24px] text-[rgba(0,0,0,0.55)] tracking-[-0.12px] w-[729px]">
        <p className="leading-[1.45]">Browse, reserve, and manage all your reads.</p>
      </div>
    </div>
  );
}

function PrimaryButton() {
  return (
    <div className="bg-black content-stretch flex items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0" data-name="Primary button">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Sign in</p>
      </div>
    </div>
  );
}

function SecondaryButton() {
  return (
    <div className="content-stretch flex items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0" data-name="Secondary button">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.15)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-black tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Create account</p>
      </div>
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-center flex flex-wrap gap-[16px] items-center relative shrink-0" data-name="Buttons">
      <PrimaryButton />
      <SecondaryButton />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex flex-col h-[70px] items-start justify-center px-[20px] relative rounded-[12px] shrink-0 w-[1024px]">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#9e9e9e] text-[24px] text-center tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Search for books, authors, or genres...</p>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="h-[473px] relative shrink-0 w-full" data-name="Hero">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[48px] items-center px-[64px] py-[120px] relative size-full">
          <Text />
          <Buttons />
          <Frame />
        </div>
      </div>
    </section>
  );
}

function Image() {
  return (
    <section className="h-[924px] relative shrink-0 w-full" data-name="Image">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[64px] py-[30px] relative size-full">
          <div className="h-[800px] relative shrink-0 w-[1200px]" data-name="gabriel-sollmann-Y7d265_7i08-unsplash 1">
            <img alt="Library" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGabrielSollmannY7D2657I08Unsplash1} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center relative shrink-0 text-[36px] text-black tracking-[-0.72px] w-full">
        <h2 className="block leading-[1.2]">Explore our collection</h2>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[18px] text-[rgba(0,0,0,0.55)] tracking-[-0.09px] w-full">
        <p className="leading-[1.45]">Reserve books online, track due dates, and manage returns - all from your dashboard.</p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-center min-h-px min-w-px relative" data-name="Content">
      <Text1 />
    </div>
  );
}

function Row() {
  return (
    <div className="relative shrink-0 w-full" data-name="Row 1">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[64px] items-center justify-center pb-[40px] pt-[80px] px-[64px] relative w-full">
          <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
            <Content />
          </div>
          <div className="h-[600px] relative shrink-0 w-[400px]" data-name="image 1">
            <img alt="Picking out a book" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature() {
  return (
    <section className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Feature">
      <Row />
    </section>
  );
}

function TextBlock1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[324px] pt-[24px] relative" data-name="Text block 1">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px] whitespace-nowrap">{`Browse & reserve`}</p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">Explore thousands of titles by genre, author, or title. Reserve books instantly and pick them up at your convenience.</p>
      </div>
    </div>
  );
}

function TextBlock2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[324px] pt-[24px] relative" data-name="Text block 2">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px] whitespace-nowrap">Track your loans</p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">Keep tabs on what you’ve borrowed, when it’s due, and your return history.</p>
      </div>
    </div>
  );
}

function TextBlock3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[324px] pt-[24px] relative" data-name="Text block 3">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px] whitespace-nowrap">Manage fines</p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">View any fines, make payments, and keep your membership in good standing.</p>
      </div>
    </div>
  );
}

function TextBlock() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Text block">
      <TextBlock1 />
      <TextBlock2 />
      <TextBlock3 />
    </div>
  );
}

function TextRow() {
  return (
    <section className="bg-[rgba(0,0,0,0.02)] relative shrink-0 w-full" data-name="Text row">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[64px] py-[120px] relative w-full">
          <TextBlock />
        </div>
      </div>
    </section>
  );
}

function Company() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Company">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-black text-center tracking-[-0.6px] whitespace-nowrap">
        <p className="leading-[1.45]">MetaBooks</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[32px] items-start leading-[0] not-italic relative shrink-0 text-[20px] text-[rgba(0,0,0,0.55)] tracking-[-0.1px] whitespace-nowrap" data-name="Nav">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">Catalog</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">About Us</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">{`Help & FAQ`}</p>
      </div>
    </nav>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex gap-[32px] items-center justify-center relative shrink-0" data-name="Text">
      <Company />
      <Nav />
    </div>
  );
}

function SocialLink() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Social link 3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Social link 3">
          <path d={svgPaths.pdaf0200} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SocialLinks() {
  return (
    <nav className="content-stretch flex items-center relative shrink-0" data-name="Social links">
      <SocialLink />
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative shrink-0 w-full" data-name="Footer">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[64px] relative w-full">
          <Text2 />
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}

export default function Container() {
  return (
    <main className="content-stretch flex flex-col items-start relative size-full" data-name="Container" tabIndex="-1">
      <Hero />
      <Image />
      <Feature />
      <TextRow />
      <Footer />
    </main>
  );
}