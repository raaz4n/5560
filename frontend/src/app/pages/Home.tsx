import { useNavigate } from "react-router";
import { motion } from "motion/react";
import svgPaths from "../../imports/svg-5vinx5hakt";
import imgGabrielSollmannY7D2657I08Unsplash1 from "figma:asset/1872b72a551730b4ff9b087199a02759c42a6fc1.png";
import imgImage1 from "figma:asset/20f7cedb03dddba5130a763226504ec61eca2864.png";
import { useAuth } from "../components/AuthContext";
import { useUserLoans } from "../hooks/useUserLoans";
import { useUserFines } from "../hooks/useUserFines";

// Animation variants for fade-in effect
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

function Text() {
  return (
    <div
      className="content-stretch flex flex-col gap-[32px] items-center leading-[0] not-italic relative shrink-0 text-center w-full"
      data-name="Text"
    >
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center min-w-full relative shrink-0 text-[64px] text-black tracking-[-1.6px] w-[min-content]">
        <h1 className="block leading-[1.1] font-bold text-[65px]">
          MetaBooks
        </h1>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[24px] text-[rgba(0,0,0,0.55)] tracking-[-0.12px] max-w-[729px]">
        <p className="leading-[1.45]">
          Browse, reserve, and manage all your reads.
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-black content-stretch flex items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0 hover:bg-gray-800 transition-colors cursor-pointer"
      data-name="Primary button"
    >
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Sign in</p>
      </div>
    </button>
  );
}

function SecondaryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex items-center justify-center px-[16px] py-[12px] relative rounded-[12px] shrink-0 hover:bg-gray-50 transition-colors cursor-pointer"
      data-name="Secondary button"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[rgba(0,0,0,0.15)] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-black tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Create account</p>
      </div>
    </button>
  );
}

function Buttons({
  onSignIn,
  onCreateAccount,
}: {
  onSignIn: () => void;
  onCreateAccount: () => void;
}) {
  return (
    <div
      className="content-center flex flex-wrap gap-[16px] items-center relative shrink-0"
      data-name="Buttons"
    >
      <PrimaryButton onClick={onSignIn} />
      <SecondaryButton onClick={onCreateAccount} />
    </div>
  );
}

function SearchBar({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#e8e8e8] content-stretch flex flex-col h-[70px] items-start justify-center px-[20px] relative rounded-[12px] shrink-0 w-full max-w-[1024px] cursor-pointer hover:bg-[#d8d8d8] transition-colors"
    >
      <div className="w-full font-['Inter:Medium',sans-serif] font-medium text-[24px] tracking-[-0.12px] text-[#9e9e9e]">
        Search for books, authors, or genres...
      </div>
    </div>
  );
}

function Hero({ onSignIn, onCreateAccount, onSearchClick, user }) {
  return (
    <section className="min-h-[473px] relative shrink-0 w-full">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[48px] items-center px-4 md:px-[64px] py-[80px] md:py-[120px] relative size-full">
          <Text />

          {user ? (
            <div className="text-2xl font-semibold text-black">
              Welcome back, {user.First_name}!
            </div>
          ) : (
            <Buttons
              onSignIn={onSignIn}
              onCreateAccount={onCreateAccount}
            />
          )}

          <SearchBar onClick={onSearchClick} />
        </div>
      </div>
    </section>
  );
}


function Image() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={fadeInUpVariants}
      className="min-h-[600px] md:h-[924px] relative shrink-0 w-full"
      data-name="Image"
    >
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-4 md:px-[64px] py-[30px] relative size-full">
          <div
            className="h-[400px] md:h-[800px] relative shrink-0 w-full max-w-[1200px]"
            data-name="gabriel-sollmann-Y7d265_7i08-unsplash 1"
          >
            <img
              alt="Library"
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full rounded-lg"
              src={imgGabrielSollmannY7D2657I08Unsplash1}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Text1() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start leading-[0] not-italic relative shrink-0 w-full"
      data-name="Text"
    >
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center relative shrink-0 text-[36px] text-black tracking-[-0.72px] w-full">
        <h2 className="block leading-[1.2] font-bold text-[40px]">
          Explore our collection
        </h2>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[18px] text-[rgba(0,0,0,0.55)] tracking-[-0.09px] w-full">
        <p className="leading-[1.45]">
          Reserve books online, track due dates, and manage
          returns - all from your dashboard.
        </p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-center min-h-px min-w-px relative"
      data-name="Content"
    >
      <Text1 />
    </div>
  );
}

function Row() {
  return (
    <div className="relative shrink-0 w-full" data-name="Row 1">
      <div className="flex flex-col md:flex-row items-center justify-center size-full">
        <div className="content-stretch flex flex-col md:flex-row gap-[32px] md:gap-[64px] items-center justify-center pb-[40px] pt-[40px] md:pt-[80px] px-4 md:px-[64px] relative w-full">
          <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
            <Content />
          </div>
          <div
            className="h-[400px] md:h-[600px] relative shrink-0 w-full md:w-[400px]"
            data-name="image 1"
          >
            <img
              alt="Picking out a book"
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full rounded-lg"
              src={imgImage1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={fadeInUpVariants}
      className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full"
      data-name="Feature"
    >
      <Row />
    </motion.section>
  );
}

function TextBlock1() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[280px] pt-[24px] relative"
      data-name="Text block 1"
    >
      <div
        aria-hidden="true"
        className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none"
      />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px]">{`Browse & reserve`}</p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">
          Explore thousands of titles by genre, author, or
          title. Reserve books instantly and pick them up at
          your convenience.
        </p>
      </div>
    </div>
  );
}

function TextBlock2() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[280px] pt-[24px] relative"
      data-name="Text block 2"
    >
      <div
        aria-hidden="true"
        className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none"
      />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px] whitespace-nowrap">
        Track your loans
      </p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">
          Keep tabs on what you've borrowed, when it's due, and
          your return history.
        </p>
      </div>
    </div>
  );
}

function TextBlock3() {
  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-[280px] pt-[24px] relative"
      data-name="Text block 3"
    >
      <div
        aria-hidden="true"
        className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none"
      />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-none not-italic relative shrink-0 text-[24px] text-black tracking-[-0.48px] whitespace-nowrap">
        Manage fines
      </p>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
        <p className="leading-[1.45]">
          View any fines, make payments, and keep your
          membership in good standing.
        </p>
      </div>
    </div>
  );
}

function TextBlock() {
  return (
    <div
      className="content-stretch flex flex-col md:flex-row gap-[32px] md:gap-[48px] items-start relative shrink-0 w-full"
      data-name="Text block"
    >
      <TextBlock1 />
      <TextBlock2 />
      <TextBlock3 />
    </div>
  );
}

function TextRow() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={fadeInUpVariants}
      className="bg-[rgba(0,0,0,0.02)] relative shrink-0 w-full"
      data-name="Text row"
    >
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-4 md:px-[64px] py-[60px] md:py-[120px] relative w-full">
          <TextBlock />
        </div>
      </div>
    </motion.section>
  );
}

function Company() {
  return (
    <div
      className="content-stretch flex items-center relative shrink-0"
      data-name="Company"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-black text-center tracking-[-0.6px] whitespace-nowrap">
        <p className="leading-[1.45]">MetaBooks</p>
      </div>
    </div>
  );
}

function Nav() {
  const navigate = useNavigate();

  return (
    <nav
      className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[32px] items-start leading-[0] not-italic relative shrink-0 text-[20px] text-[rgba(0,0,0,0.55)] tracking-[-0.1px]"
      data-name="Nav"
    >
      <button
        onClick={() => navigate("/search")}
        className="flex flex-col justify-center relative shrink-0 hover:text-black transition-colors cursor-pointer"
      >
        <p className="leading-[1.45]">Search Catalog</p>
      </button>
      <div className="flex flex-col justify-center relative shrink-0 hover:text-black transition-colors cursor-pointer">
        <p className="leading-[1.45]">About Us</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 hover:text-black transition-colors cursor-pointer">
        <p className="leading-[1.45]">{`Help & FAQ`}</p>
      </div>
    </nav>
  );
}

function Text2() {
  return (
    <div
      className="content-stretch flex flex-col md:flex-row gap-[24px] md:gap-[32px] items-center justify-center relative shrink-0"
      data-name="Text"
    >
      <Company />
      <Nav />
    </div>
  );
}

function SocialLink() {
  return (
    <div
      className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity"
      data-name="Social link 3"
    >
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="Social link 3">
          <path
            d={svgPaths.pdaf0200}
            fill="var(--fill-0, black)"
            fillOpacity="0.45"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function SocialLinks() {
  return (
    <nav
      className="content-stretch flex items-center relative shrink-0"
      data-name="Social links"
    >
      <SocialLink />
    </nav>
  );
}

function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={fadeInUpVariants}
      className="relative shrink-0 w-full"
      data-name="Footer"
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex flex-col md:flex-row items-center justify-between p-4 md:p-[64px] gap-8 relative w-full">
          <Text2 />
          <SocialLinks />
        </div>
      </div>
    </motion.footer>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, loading: loansLoading } = useUserLoans();
  const { fines, finesLoading } = useUserFines();

  return (
    <main
      className="content-stretch flex flex-col items-start relative size-full"
      data-name="Container"
      tabIndex={-1}
    >
    <Hero
      user={user}
      onSignIn={() => navigate("/signin")}
      onCreateAccount={() => navigate("/signup")}
      onSearchClick={() => navigate("/search")}
      />
      {user && (
        <section className="w-full px-4 md:px-16 py-12">
          <h2 className="text-3xl font-semibold mb-6">Your Loans</h2>
  
          {loansLoading ? (
            <p className="text-gray-500">Loading your loans…</p>
          ) : loans.length === 0 ? (
            <p className="text-gray-500">You have no active loans.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <div key={loan.Loan_id} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-medium">{loan.Title}</h3>
                  <p className="text-gray-600">Due: {loan.Due_date}</p>
                  <p className="text-gray-600">Status: {loan.Status}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {user && (
        <section className="w-full px-4 md:px-16 py-12">
          <h2 className="text-3xl font-semibold mb-6">Your Fines</h2>

          {finesLoading ? (
            <p className="text-gray-500">Loading your fines…</p>
          ) : fines.length === 0 ? (
            <p className="text-gray-500">You have no fines.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fines.map((fine) => (
                <div key={fine.Fine_id} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-medium">{fine.Title}</h3>

                  <p className="text-gray-600">
                    Amount: ${fine.Fine_amount.toFixed(2)}
                  </p>

                  <p className="text-gray-600">
                    Status: {fine.Paid_status}
                  </p>

                  {fine.Payment_date && (
                    <p className="text-gray-600">
                      Paid on: {fine.Payment_date}
                    </p>
                  )}

                  <p className="text-gray-600">
                    Loan Status: {fine.Loan_status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <Image />
      <Feature />
      <TextRow />
      <Footer />
    </main>
  );
}