import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Header from "../components/Header";
import MapViewer from "../components/MapViewer";

const PublicHome: React.FC = () => {
  return (
    <div className="bg-light min-vh-100 w-100">
      <Header />
      <div className="container-fluid p-0" style={{ width: "100vw", maxWidth: "100vw" }}>
        <div className="row m-0 p-0" style={{ width: "100vw", maxWidth: "100vw" }}>
          <div className="col-12 p-0" style={{ width: "100vw", maxWidth: "100vw" }}>
            <div style={{ width: "100vw", maxWidth: "100vw", margin: 0, padding: 0 }}>
              <MapViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
