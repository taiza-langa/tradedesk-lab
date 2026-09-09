"use client";
// Bug B2: este componente faz fetch de /api/acoes/[ticker] com useEffect para "manter
// o preço atualizado", mas o dado já chega via props (acao.preco).
// O fetch é redundante, processa dados no cliente que já estavam disponíveis no servidor,
// e causa um flash de "Carregando preço..." desnecessário a cada render.
// Fix: remover o useEffect e o estado precoAtual, usar acao.preco diretamente.

import { useState } from "react";
import type { Acao } from "@/types/acao";

interface Props { acao: Acao; }

export default function BoletaForm({ acao }: Props) {
  const [quantidade, setQuantidade] = useState(0); // Bug B14: string, não number
  const [enviado, setEnviado] = useState(false);

  // Bug B13: acao.preco é undefined quando a API retorna dados brapi raw (usa regularMarketPrice)
  // Bug B14: quantidade (string) * precoAtual (number) = NaN → || 0 esconde o bug
  const total = quantidade * acao.preco;

  async function handleCompra() {
    await fetch("/api/ordens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: acao.ticker,
        quantidade: quantidade,
        preco: acao.preco,  // Bug B13: pode ser undefined quando brapi está online
        total,
        tipo: "compra",
      }),
    });
    setEnviado(true);
  }

  if (enviado) return (
    <div className="card-terminal" style={{ textAlign: "center", color: "#22c55e" }}>
      ✅ Ordem enviada!
    </div>
  );

  return (
    <div className="card-terminal">
      <h3 style={{ marginBottom: "1rem", color: "#f59e0b" }}>Boleta de Compra</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#888" }}>Ativo</label>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{acao.ticker}</div>
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#888" }}>Preço atual</label>
          {/* Bug B13: quando brapi está online, precoAtual pode ser undefined → exibe "R$ undefined" */}
          <div style={{ fontSize: "1.1rem" }}>
            {acao.preco === undefined ? "Carregando preço..." : `R$ ${acao.preco.toFixed(2)}`}
          </div>
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Quantidade</label>
          <input
            type="number"
            value={quantidade || ""}
            onChange={e => setQuantidade(Number(e.target.value))} // Bug B14: e.target.value é string
            placeholder="Ex: 100"
            min="1"
            style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#e5e5e5", padding: "0.5rem", borderRadius: 4, fontFamily: "monospace" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#888" }}>Total estimado</label>
          {/* Bug B14: sempre mostra R$ 0 por causa do || 0 */}
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f59e0b" }}>R$ {total.toFixed(2)}</div>
        </div>
        <button
          onClick={handleCompra}
          style={{ background: "#22c55e", color: "#000", border: "none", padding: "0.75rem", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
        >
          CONFIRMAR COMPRA
        </button>
      </div>
    </div>
  );
}
