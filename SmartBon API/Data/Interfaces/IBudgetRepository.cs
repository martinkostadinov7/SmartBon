using Data.Models;
using Microsoft.EntityFrameworkCore;
namespace Data.Interfaces
{
    public interface IBudgetRepository : IRepository<Budget>
    {
        public Task<List<Budget>> GetAll(int userId);
    }
}
