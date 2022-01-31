import Navbar from "../ui/Navbar";

export const AppLayout = ({ children }) => (
  <div className="flex flex-col w-screen h-screen">
    <Navbar />
    {children}
  </div>
);
