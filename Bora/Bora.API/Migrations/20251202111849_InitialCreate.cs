using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bora.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Dias",
                columns: table => new
                {
                    Data = table.Column<string>(type: "TEXT", nullable: false),
                    Entrada = table.Column<string>(type: "TEXT", nullable: true),
                    Saida = table.Column<string>(type: "TEXT", nullable: true),
                    KmInicial = table.Column<double>(type: "REAL", nullable: false),
                    KmFinal = table.Column<double>(type: "REAL", nullable: false),
                    KmRodados = table.Column<double>(type: "REAL", nullable: false),
                    Ganhos = table.Column<decimal>(type: "TEXT", nullable: false),
                    GastoGasolina = table.Column<decimal>(type: "TEXT", nullable: false),
                    GastoManutencao = table.Column<decimal>(type: "TEXT", nullable: false),
                    GastoAntecipacao = table.Column<decimal>(type: "TEXT", nullable: false),
                    MetaBatida = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dias", x => x.Data);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Dias");
        }
    }
}
