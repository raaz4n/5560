function LastName() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[42px] items-center left-[24px] p-[10px] right-[24px] rounded-[10px] top-[calc(50%+24px)]" data-name="last name">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[15px] text-[rgba(0,0,0,0.7)] whitespace-nowrap">Password</p>
    </div>
  );
}

function FirstName() {
  return (
    <div className="absolute content-stretch flex h-[42px] items-center left-[24px] p-[10px] right-[24px] rounded-[10px] top-[169px]" data-name="first name">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[15px] text-[rgba(0,0,0,0.7)] whitespace-nowrap">ID</p>
    </div>
  );
}

function RegisterBtn() {
  return (
    <div className="absolute bg-black content-stretch flex inset-[79.23%_6%_11.89%_6%] items-center justify-center p-[10px] rounded-[20px]" data-name="Register_btn">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f4f4f4] text-[15px] whitespace-nowrap">Sign in</p>
    </div>
  );
}

function SignupBtn() {
  return (
    <div className="absolute bottom-[13px] content-stretch flex h-[38px] items-center justify-center left-[38px] p-[10px] right-[39px] rounded-[20px]" data-name="signup_btn">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#9d9d9d] text-[0px] text-[15px] whitespace-nowrap">
        <span className="leading-[normal]">{`Don’t have an account? `}</span>
        <a className="cursor-pointer decoration-solid leading-[normal] text-[#191919] underline" href="https://www.figma.com/design/1LneMjK82T2JYNVBewL3TX?node-id=6-20">
          <span className="decoration-solid leading-[normal]" href="https://www.figma.com/design/1LneMjK82T2JYNVBewL3TX?node-id=6-20">
            Register here
          </span>
        </a>
        <span className="leading-[normal]">.</span>
      </p>
    </div>
  );
}

function RegisterLight() {
  return (
    <div className="h-[428px] relative shrink-0 w-[638px]" data-name="Register-Light">
      <div className="absolute bg-[#f4f4f4] inset-0 rounded-[10px]" data-name="background" />
      <div className="absolute bg-[#f4f4f4] inset-0 rounded-[10px]" data-name="background" />
      <p className="-translate-x-1/2 absolute bottom-[81.62%] font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[calc(50%+0.35px)] not-italic text-[44px] text-black text-center top-[6%] w-[288.695px]">Sign in</p>
      <LastName />
      <FirstName />
      <RegisterBtn />
      <SignupBtn />
    </div>
  );
}

function Feature() {
  return (
    <section className="absolute content-stretch flex inset-0 items-center justify-center px-[64px] py-[120px]" data-name="Feature 1">
      <RegisterLight />
    </section>
  );
}

function Desktop1() {
  return (
    <div className="bg-white h-[1080px] overflow-x-clip overflow-y-auto relative shrink-0 w-[1280px]" data-name="Desktop">
      <Feature />
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] left-[64px] not-italic right-[64px] text-[64px] text-black text-center top-[116px] tracking-[-1.6px]" href="https://www.figma.com/design/1LneMjK82T2JYNVBewL3TX?node-id=4-401">
        <h1 className="block cursor-pointer decoration-solid leading-[1.1] underline">MetaBooks</h1>
      </a>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="Desktop">
      <Desktop1 />
    </div>
  );
}