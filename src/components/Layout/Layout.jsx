import Sidebar from "../components/Admin/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64">
        {children}
      </div>

    </div>
  );
};

export default Layout;