using Data.Models;
using Microsoft.EntityFrameworkCore;
namespace Data.Interfaces
{
    public interface IGoalRepository : IRepository<Goal>
    {
        public Task<List<Goal>> GetAllAsync(int userId, bool? isActive = true);
    }
}
