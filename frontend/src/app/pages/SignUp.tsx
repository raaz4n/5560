import { useState } from "react";
import { useNavigate } from "react-router";
import NavBar from "../components/NavBar";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          address,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((d: any) => d.msg).join(", ")
          : data.detail;

        alert(message || "Signup failed");
        return;
      }

      alert("Registration successful!");
      navigate("/signin");

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="bg-white content-stretch flex flex-col relative size-full min-h-screen">
      <NavBar />
      <div className="flex flex-col items-center justify-center flex-1 p-4" data-name="Desktop">
        <div className="bg-white max-w-[1280px] w-full relative flex flex-col items-center" data-name="Desktop">
        <h1 
          onClick={() => navigate('/')}
          className="font-['Inter:Bold',sans-serif] font-bold text-[44px] md:text-[64px] text-black text-center tracking-[-1.6px] leading-[1.1] mb-8 md:mb-12 cursor-pointer hover:opacity-80 transition-opacity underline decoration-2"
        >
          MetaBooks
        </h1>
        
        <section className="content-stretch flex items-center justify-center w-full" data-name="Feature 1">
          <div className="relative shrink-0 w-full max-w-[638px]" data-name="Register-Light">
            <div className="bg-[#f4f4f4] rounded-[10px] p-8 md:p-12" data-name="background">
              <form onSubmit={handleSubmit} className="relative flex flex-col">
                <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] text-[36px] md:text-[44px] text-black text-center mb-8">
                  Register
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                      required
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                      required
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                      required
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address (optional)"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                      required
                    />
                  </div>

                  <div className="content-stretch flex h-[42px] items-center p-[10px] rounded-[10px] relative">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic w-full bg-transparent outline-none text-[15px] text-black placeholder:text-[rgba(0,0,0,0.7)]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-black content-stretch flex items-center justify-center p-[10px] rounded-[20px] h-[48px] mt-8 hover:bg-gray-800 transition-colors"
                >
                  <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic text-[#f4f4f4] text-[15px] whitespace-nowrap">
                    Register
                  </p>
                </button>

                <div className="content-stretch flex items-center justify-center p-[10px] rounded-[20px] mt-4">
                  <p className="font-['Inter:Medium',sans-serif] font-medium not-italic text-[#9d9d9d] text-[15px] text-center">
                    <span>Have an account? </span>
                    <span 
                      onClick={() => navigate('/signin')}
                      className="cursor-pointer text-[#191919] underline hover:opacity-70 transition-opacity"
                    >
                      Sign in here
                    </span>
                    <span>.</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}