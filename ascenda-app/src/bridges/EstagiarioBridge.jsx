import { useLocation, useParams } from "react-router-dom";
import interns from "@/data/interns.json";
import EstagiarioApp from "@estagiario/App";

export default function EstagiarioBridge() {
  const { state } = useLocation();
  const { internId } = useParams();
  const intern = state || interns.find((item) => item.id === internId);

  return <EstagiarioApp intern={intern} />;
}
