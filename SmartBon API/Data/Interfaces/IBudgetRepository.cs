using Data.Models;
using Microsoft.EntityFrameworkCore;
namespace Data.Interfaces
{
    public interface IBudgetRepository : IRepository<Budget>
    {
        public Task<List<Budget>> GetAllAsync(int userId, bool? active = true);
        Task<bool> DeleteAllAsync(int userId);

    }
}
