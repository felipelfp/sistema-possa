using Microsoft.EntityFrameworkCore;
using FinancialApi.Models;

namespace FinancialApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Objective> Objectives { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<AppSettings> Settings { get; set; }
        public DbSet<Debt> Debts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed initial settings if needed
            modelBuilder.Entity<AppSettings>().HasData(
                new AppSettings { Id = 1, ExchangeRate = 5.0m, LastUpdated = new DateTime(2024, 1, 1) }
            );
        }
    }
}
