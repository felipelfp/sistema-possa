using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinancialApi.Data;
using FinancialApi.Models;

namespace FinancialApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebtsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DebtsController(AppDbContext context)
        {
            _context = context;
        }

        [get]
        public async Task<ActionResult<IEnumerable<Debt>>> GetDebts()
        {
            return await _context.Debts.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Debt>> PostDebt(Debt debt)
        {
            _context.Debts.Add(debt);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDebts), new { id = debt.Id }, debt);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDebt(int id, Debt debt)
        {
            if (id != debt.Id) return BadRequest();
            _context.Entry(debt).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDebt(int id)
        {
            var debt = await _context.Debts.FindAsync(id);
            if (debt == null) return NotFound();
            _context.Debts.Remove(debt);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
