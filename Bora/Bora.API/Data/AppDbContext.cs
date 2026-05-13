using Microsoft.EntityFrameworkCore;
using Bora.API.Models;

namespace Bora.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<DiaTrabalho> Dias { get; set; }
    }
}
