using System.ComponentModel.DataAnnotations;

namespace Bora.API.Models
{
    public class DiaTrabalho
    {
        [Key]
        public string Data { get; set; } = string.Empty; // Format: YYYY-MM-DD

        public string? Entrada { get; set; }
        public string? Saida { get; set; }

        public double KmInicial { get; set; }
        public double KmFinal { get; set; }
        public double KmRodados { get; set; }

        public decimal Ganhos { get; set; }
        public decimal GastoGasolina { get; set; }
        public decimal GastoManutencao { get; set; }
        public decimal GastoAntecipacao { get; set; }

        public bool MetaBatida { get; set; }
    }
}
