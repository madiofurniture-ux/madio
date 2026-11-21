import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MadioLayout } from "./layouts/MadioLayout";

// Each page is its own chunk, so a visitor only downloads the code for the
// page they open (plus the shared layout). The prerendered HTML shows the
// page immediately; React hydrates it once the chunk arrives.
const page = <T extends Record<string, React.ComponentType>>(
  load: () => Promise<T>,
  name: keyof T,
) => lazy(() => load().then((m) => ({ default: m[name] })));

const FurnitureLanding = page(() => import("./pages/FurnitureLanding"), "FurnitureLanding");
const FurnitureCategoryPage = page(() => import("./pages/FurnitureCategoryPage"), "FurnitureCategoryPage");
const FurnitureProductDetail = page(() => import("./pages/FurnitureProductDetail"), "FurnitureProductDetail");
const DoorsWindows = page(() => import("./pages/DoorsWindows"), "DoorsWindows");
const DoorsWindowsDetail = page(() => import("./pages/DoorsWindowsDetail"), "DoorsWindowsDetail");
const DWSystems = page(() => import("./pages/DWSystems"), "DWSystems");
const DWDesignMaterials = page(() => import("./pages/DWDesignMaterials"), "DWDesignMaterials");
const DWArchitects = page(() => import("./pages/DWArchitects"), "DWArchitects");
const DWResources = page(() => import("./pages/DWResources"), "DWResources");
const DWProjects = page(() => import("./pages/DWProjects"), "DWProjects");
const DWConsultation = page(() => import("./pages/DWConsultation"), "DWConsultation");
const Home = page(() => import("./pages/Home"), "Home");
const About = page(() => import("./pages/About"), "About");
const Products = page(() => import("./pages/Products"), "Products");
const TextureGallery = page(() => import("./pages/TextureGallery"), "TextureGallery");
const ColorCollections = page(() => import("./pages/ColorCollections"), "ColorCollections");
const Contact = page(() => import("./pages/Contact"), "Contact");
const Stencils = page(() => import("./pages/Stencils"), "Stencils");
const AdminUpload = page(() => import("./pages/admin/AdminUpload"), "AdminUpload");

export const AppRoutes: React.FC = () => (
  <Suspense fallback={null}>
    <Routes>
      {/* Admin tool — deliberately outside MadioLayout (no public header/nav/footer)
          and not linked from anywhere in the site. Password-gated in the page itself. */}
      <Route path="admin/upload" element={<AdminUpload />} />

      {/* All pages share the unified MadioLayout which includes the vertical switcher header */}
      <Route element={<MadioLayout />}>
        {/* Flagship Furniture Homepage */}
        <Route index element={<FurnitureLanding />} />

        {/* Contact Page */}
        <Route path="contact" element={<Contact />} />

        {/* Furniture Subpages */}
        <Route path="furniture">
          <Route index element={<Navigate to="/" replace />} />
          <Route path=":category" element={<FurnitureCategoryPage />} />
          <Route path=":category/:productId" element={<FurnitureProductDetail />} />
        </Route>

        {/* Doors & Windows vertical routes */}
        <Route path="doors-windows">
          <Route index element={<DoorsWindows />} />
          {/* Static division pages rank above the :category catch-all. */}
          <Route path="systems" element={<DWSystems />} />
          <Route path="design-materials" element={<DWDesignMaterials />} />
          <Route path="architects" element={<DWArchitects />} />
          <Route path="resources" element={<DWResources />} />
          <Route path="projects" element={<DWProjects />} />
          <Route path="consultation" element={<DWConsultation />} />
          <Route path=":category" element={<DoorsWindowsDetail />} />
        </Route>

        {/* MAP vertical routes */}
        <Route path="map">
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="gallery" element={<TextureGallery />} />
          <Route path="colors" element={<ColorCollections />} />
          <Route path="quote" element={<Navigate to="/contact?source=map" replace />} />
          <Route path="contact" element={<Navigate to="/contact?source=map" replace />} />
          <Route path="stencils" element={<Stencils />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);
