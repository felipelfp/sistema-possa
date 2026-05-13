using System;

namespace FinancialApi.Models
{
    public class Debt
    {
        public int Id { get; set; }
        public string Titular { get; set; } = string.Empty;
        public string Banco { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string Tipo { get; set; } = "avista"; // "avista" or "parcelado"
        public decimal VlrP { get; set; } // Valor da Proposta ou Parcela
        public int Qtd { get; set; } // Quantidade de Parcelas
        public string Status { get; set; } = "pendente"; // "pendente", "andamento", "quitado"
    }
}
