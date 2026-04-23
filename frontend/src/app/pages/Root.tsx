import { Outlet } from "react-router";
import "../../styles/index.css";

export default function Root() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Outlet />
    </div>
  );
}
