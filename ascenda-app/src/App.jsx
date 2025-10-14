import { BrowserRouter, Routes, Route } from "react-router-dom";
import PadrinhoBridge from "./bridges/PadrinhoBridge";
import EstagiarioBridge from "./bridges/EstagiarioBridge";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/padrinho/*" element={<PadrinhoBridge />} />
        <Route path="/estagiario/:internId/*" element={<EstagiarioBridge />} />
        <Route path="*" element={<div>Select Padrinho or Estagiario</div>} />
      </Routes>
    </BrowserRouter>
  );
}
