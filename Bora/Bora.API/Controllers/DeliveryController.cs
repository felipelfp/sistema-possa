using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Bora.API.Data;
using Bora.API.Models;

namespace Bora.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DeliveryController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/delivery
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiaTrabalho>>> GetDias()
        {
            return await _context.Dias.ToListAsync();
        }

        // GET: api/delivery/hoje
        [HttpGet("hoje")]
        public async Task<ActionResult<DiaTrabalho>> GetHoje()
        {
            var hoje = DateTime.Now.ToString("yyyy-MM-dd");
            var dia = await _context.Dias.FindAsync(hoje);

            if (dia == null)
            {
                return NotFound();
            }

            return dia;
        }

        // POST: api/delivery
        [HttpPost]
        public async Task<ActionResult<DiaTrabalho>> PostDia(DiaTrabalho dia)
        {
            var existingDia = await _context.Dias.FindAsync(dia.Data);
            if (existingDia != null)
            {
                _context.Entry(existingDia).CurrentValues.SetValues(dia);
            }
            else
            {
                _context.Dias.Add(dia);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHoje), new { id = dia.Data }, dia);
        }
    }
}
