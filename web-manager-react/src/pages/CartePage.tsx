import React from "react";
import MapViewer from "../components/MapViewer";
import Sidebar from "../components/Sidebar";
import "../styles/cartePage.css";

const CartePage: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Reuse the MapViewer component so manager and public views share the same map implementation */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%" }}>
              <MapViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartePage;
