import { useEffect, useState } from "react";
import Pos from "./Pos";
import Ledger from "./Ledger";

const route = () => (window.location.hash === "#/ledger" ? "ledger" : "pos");

export default function App() {
  const [page, setPage] = useState(route());
  useEffect(() => {
    const on = () => setPage(route());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return (
    <>
      {page === "ledger" ? <Ledger /> : <Pos />}
    </>
  );
}
